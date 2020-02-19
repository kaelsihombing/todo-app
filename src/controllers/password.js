const User = require('../models/user');

const mailer = require('../helpers/nodeMailer')

const bcrypt = require('bcryptjs')

exports.recover = (req, res) => {
    User.findOne({ email: req.body.email })
        .then(async user => {
            
            if (!user) return res.status(401).json({ message: 'The email address ' + req.body.email + ' is not associated with any account. Double-check your email address and try again.' });
            //Generate and set password reset token
            await User.generatePasswordReset(user._id)

                .then(user => {
                    // send email
                    let link = "http://" + req.headers.host + "/api/v1/reset/" + user.resetPasswordToken;
                    const mailOptions = {
                        to: user.email,
                        from: process.env.FROM_EMAIL,
                        subject: "Password change request",
                        text: `Hi ${user.fullname} \n 
                    Please click on the following link ${link} to reset your password. \n\n 
                    If you did not request this, please ignore this email and your password will remain unchanged.\n`,
                    };

                    mailer.send(mailOptions, (error) => {
                        if (error) return res.status(500).json({ message: error.message });

                        res.status(200).json({ message: 'A reset email has been sent to ' + user.email + ', please check your email.' });
                    });
                })
                .catch(err => res.status(500).json({ message: err.message }));
        })
        .catch(err => res.status(500).json({ message: err.message }));
};


exports.reset = (req, res) => {

    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } })
        .then(user => {
            if (!user) return res.status(401).json({ message: 'Password reset token is invalid or has expired.' });

            //Redirect user to form with the email address
            res.render('reset', { user });
        })
        .catch(err => res.status(500).json({ message: err.message }));
};



exports.resetPassword = (req, res) => {

    User.findOne({ resetPasswordToken: req.params.token })
        .then(async user => {
            if (!user) return res.status(401).json({ message: 'Password reset token is invalid or has expired.' });

            //Set the new password
            user.encrypted_password = await bcrypt.hashSync(req.body.password, 10);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            // Save
            user.save((err) => {

                if (err !== null) return res.status(500).json({ message: 'Error brooo' });

                // send email
                const mailOptions = {
                    to: user.email,
                    from: process.env.FROM_EMAIL,
                    subject: "Your password has been changed",
                    text: `Hi ${user.fullname} \n 
                    This is a confirmation that the password for your account ${user.email} has just been changed.\n`
                };

                mailer.send(mailOptions, (error) => {
                    if (error) return res.status(500).json({ message: error.message });
                    res.render('done')
                    // res.status(200).json({ message: 'Your password has been updated.' });
                });
            });
        });
};