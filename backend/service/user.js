const User = require("../model/user");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            res.status(400).send("Missing inputs!");
        }
        
        const oldUser = await User.findOne({ username });
    
        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            username: username, 
            password: hashedPassword,
        });

        res.status(201).send("User created");
    } catch (err) {
        console.log(err)
        res.status(500).send();
    }
}

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
    
        if (!username || !password) {
            return res.status(400).send("Missing inputs!");
        }
    
        const user = await User.findOne({ username });
    
        if (user && (await bcrypt.compare(password, user.password))) {
            const token = jwt.sign(
                { user_id: user._id, username },
                process.env.JWT_SECRET,
                {
                    expiresIn: "2h",
                }
            );

            return res.status(200).json({token});
        } else {
            return res.status(400).send("Invalid Credentials");
        }
    } catch (err) {
        console.log(err);
    }
}
