const express = require ('express');
const cors = require ('cors');
const mongoose = require ('mongoose');
const User = require ('./models/User');
const Channel = require('./models/Channel');
const Message = require('./models/Message');
const MailVerification = require('./models/MailVerification');
const bcrypt = require ('bcryptjs');
const jwt = require ('jsonwebtoken');
const cookieParser = require ('cookie-parser');
const sesion = require ('express-session');
const Iyzipay = require('iyzipay');
const nodemailer = require('nodemailer');
const crypto = require ('crypto');
const http = require('http');
const { Server } = require('socket.io');
const { time } = require('console');

const app = express ();
const server = http.createServer(app);

require ('dotenv').config ();

const salt = bcrypt.genSaltSync(10);
const secret = process.env.SECRET;

const io = new Server(server, {
    cors: {
        origin: ['http://localhost:3000'],
        credentials: true,
        methods: 'GET, POST, PUT, DELETE',
        allowedHeaders: 'Content-Type, Authorization',
    },
});

const corsOptions = {
    origin: ['http://localhost:3000', 'http://localhost:3030'],
    credentials: true,
    methods: 'GET, POST, PUT, DELETE, OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
};

app.use (cors (corsOptions));
app.use (express.json ());
app.use (cookieParser ());

app.use (sesion ({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
}));

const iyzipay = new Iyzipay({
    apiKey: process.env.IYZICO_API_KEY,
    secretKey: process.env.IYZICO_SECRET_KEY,
    uri: 'https://sandbox-api.iyzipay.com'
});

mongoose.connect (process.env.MONGODB_URL)
.then (() => { console.log ('Connected to MongoDB') })
.catch ((e) => { console.error ('Error connecting to MongoDB:', e) });



const transporter = nodemailer.createTransport({
    host: 'ssl://smtp.yandex.com',
    service: 'Yandex',
    port: 465,
    auth: {
        user: `${process.env.MAIL_ADRESS}`,
        pass: `${process.env.YANDEXSMTP_PASSWORD}`
    },
});

//! Socket.IO bağlantılarını dinle
io.on('connection', (socket) => {
    console.log('Yeni bir kullanıcı bağlandı:', socket.id);

    socket.on('sendMessage', async (data) => {
        const { content, sender, senderInfo, channel } = data;
        try {
            const user = await User.findById(senderInfo._id);
            if (user && user.isBanned) {
                return socket.emit('error', { message: 'You are banned. Your messages cannot be sent.' });
            }

            const message = await Message.create({
                content,
                sender,
                senderInfo,
                channel
            });

            io.to(channel).emit('newMessage', message);
        } catch (err) {
            socket.emit('error', { error: err.message });
        }
    });

    socket.on('hideMessage', async (messageId) => {
        try {
            const message = await Message.findById(messageId);
            if (!message) {
                return socket.emit('error', { message: 'Message not found' });
            }
    
            message.hidden = !message.hidden;
    
            await message.save();
    
            io.emit('hiddenMessage', message);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('highlightMessage', async (messageId) => {
        try {
            const message = await Message.findById(messageId);
            if (!message) {
                return socket.emit('error', { message: 'Message not found' });
            }
    
            message.highlighted = !message.highlighted;
    
            await message.save();
    
            io.emit('highlightedMessage', message);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });

    socket.on('addUserToChannel', async ({ userId, channelId }) => {
        try {
            const user = await User.findById(userId);
            if (!user) {
                return socket.emit('error', { message: 'User not found' });
            }

            const channel = await Channel.findById(channelId);
            if (!channel) {
                return socket.emit('error', { message: 'Channel not found' });
            }

            if (channel.allowedUsers.includes(userId)) {
                return socket.emit('error', { message: 'User already added to channel' });
            }

            channel.allowedUsers.push(userId);
            await channel.save();

            socket.emit('success', { message: 'User added to channel successfully' });
            
            const notification = await Message.create({
                content: `${user.username} kanala eklendi.`,
                sender: 'system2',
                senderInfo: '673e08d210077450d8512e62',
                channel: channelId,
                hidden: false,
                highlighted: false,
                timestamp: new Date(),
            });

            io.to(channelId).emit('newMessage', notification);
        } catch (error) {
            socket.emit('error', { message: error.message });
        }
    });


    socket.on('command', async ({ command, userId, channelId }) => {
        try {
            const user = await User.findById(userId);
            if (!user || !user.role.includes('admin')) {
                return socket.emit('error', { message: 'You are not authorized to use this command.' });
            }

            if (command === '/bot') {
                const message = await Message.create({
                    content: 'Bu bir BOT mesajıdır.',
                    sender: 'system',
                    senderInfo: '673e08d210077450d8512e62',
                    channel: channelId,
                    hidden: false,
                    highlighted: false,
                    timestamp: new Date(),
                });

                io.to(channelId).emit('newMessage', message);
            }

            if (command === '/help') {
                const message = await Message.create({
                    content: 'Kullanılabilir komutlar: /bot, /help <komut_adı> /hideall, /showall, /deleteall, /private, /addedusers, /adduser <username>, /close, /open',
                    sender: 'system',
                    senderInfo: '673e08d210077450d8512e62',
                    channel: channelId,
                    hidden: false,
                    highlighted: false,
                    timestamp: new Date(),
                });

                io.to(channelId).emit('newMessage', message);
            }

            if (command === '/help hideall') {
                const message = await Message.create({
                    content: '/hideall: Tüm mesajları gizler.',
                    sender: 'system',
                    senderInfo: '673e08d210077450d8512e62',
                    channel: channelId,
                    hidden: false,
                    highlighted: false,
                    timestamp: new Date(),
                });

                io.to(channelId).emit('newMessage', message);
            }

            if (command === '/help showall') {
                const message = await Message.create({
                    content: '/showall: Tüm mesajları gösterir.',
                    sender: 'system',
                    senderInfo: '673e08d210077450d8512e62',
                    channel: channelId,
                    hidden: false,
                    highlighted: false,
                    timestamp: new Date(),
                });

                io.to(channelId).emit('newMessage', message);
            }

            if (command === '/help deleteall') {
                const message = await Message.create({
                    content: '/deleteall: Tüm mesajları siler.',
                    sender: 'system',
                    senderInfo: '673e08d210077450d8512e62',
                    channel: channelId,
                    hidden: false,
                    highlighted: false,
                    timestamp: new Date(),
                });

                io.to(channelId).emit('newMessage', message);
            }

            if (command === '/help private') {
                const message = await Message.create({
                    content: '/private: Kanalı özel yapar. Sadece izin verilen kullanıcılar görebilir.',
                    sender: 'system',
                    senderInfo: '673e08d210077450d8512e62',
                    channel: channelId,
                    hidden: false,
                    highlighted: false,
                    timestamp: new Date(),
                });

                io.to(channelId).emit('newMessage', message);
            }

            if (command === '/help addedusers') {
                const message = await Message.create({
                    content: '/addedusers: Kanala izin verilen kullanıcıları listeler.',
                    sender: 'system',
                    senderInfo: '673e08d210077450d8512e62',
                    channel: channelId,
                    hidden: false,
                    highlighted: false,
                    timestamp: new Date(),
                });

                io.to(channelId).emit('newMessage', message);
            }

            if (command === '/help adduser') {
                const message = await Message.create({
                    content: '/adduser <username>: Kanala yeni bir kullanıcı ekler.',
                    sender: 'system',
                    senderInfo: '673e08d210077450d8512e62',
                    channel: channelId,
                    hidden: false,
                    highlighted: false,
                    timestamp: new Date(),
                });

                io.to(channelId).emit('newMessage', message);
            }

            if (command === '/help close') {
                const message = await Message.create({
                    content: '/close: Kanalı kapatır. Kapatılan kanala sadece adminler erişebilir.',
                    sender: 'system',
                    senderInfo: '673e08d210077450d8512e62',
                    channel: channelId,
                    hidden: false,
                    highlighted: false,
                    timestamp: new Date(),
                });

                io.to(channelId).emit('newMessage', message);
            }

            if (command === '/help open') {
                const message = await Message.create({
                    content: '/open: Kanalı tekrar açar. Herkes kanala erişebilir.',
                    sender: 'system',
                    senderInfo: '673e08d210077450d8512e62',
                    channel: channelId,
                    hidden: false,
                    highlighted: false,
                    timestamp: new Date(),
                });

                io.to(channelId).emit('newMessage', message);
            }

            if (command === '/hideall') {
                await Message.updateMany({ channel: channelId }, { hidden: true });

                io.to(channelId).emit('hideAllMessages');

                const notification = await Message.create({
                    content: 'Bir ADMIN tarafından bütün mesajlar gizlendi.',
                    sender: 'system',
                    senderInfo: '673e08d210077450d8512e62',
                    channel: channelId,
                    hidden: false,
                    highlighted: false,
                    timestamp: new Date(),
                });

                io.to(channelId).emit('newMessage', notification);
            }

            if (command === '/showall') {
                await Message.updateMany({ channel: channelId }, { hidden: false });

                // Notify all clients in the channel to show all messages
                io.to(channelId).emit('showAllMessages');
                
                const notification = await Message.create({
                    content: 'Bir ADMIN tarafından bütün mesajlar gösterildi.',
                    sender: 'system',
                    senderInfo: '673e08d210077450d8512e62',
                    channel: channelId,
                    hidden: false,
                    highlighted: false,
                    timestamp: new Date(),
                });

                // Emit this notification like a normal message
                io.to(channelId).emit('newMessage', notification);
            }

            if (command === '/deleteall') {
                await Message.deleteMany({ channel: channelId });

                io.to(channelId).emit('deleteAllMessages');

                const notification = await Message.create({
                    content: 'Bir ADMIN tarafından bütün mesajlar silindi.',
                    sender: 'system',
                    senderInfo: '673e08d210077450d8512e62',
                    channel: channelId,
                    hidden: false,
                    highlighted: false,
                    timestamp: new Date(),
                });

                io.to(channelId).emit('newMessage', notification);
            }

            if (command === '/addedusers') {
                const users = await User.find({ _id: { $in: Channel.allowedUsers } });
                const notification = await Message.create({
                    content: `Kanala izin verilen kullanıcılar: ${users.map(user => user.username).join(', ')}`,
                    sender: 'system',
                    senderInfo: '673e08d210077450d8512e62',
                    channel: channelId,
                    hidden: false,
                    highlighted: true,
                    timestamp: new Date(),
                });
                io.to(channelId).emit('newMessage', notification);
            }

            if (command === '/private') {
                if (!Channel.private) {
                    Channel.private = true;
                    await Channel.save();

                    const notification = await Message.create({
                        content: 'Kanal artık özel bir kanal.',
                        sender: 'system',
                        senderInfo: '673e08d210077450d8512e62',
                        channel: channelId,
                        hidden: false,
                        highlighted: true,
                        timestamp: new Date(),
                    });

                    io.to(channelId).emit('newMessage', notification);
                }
            }
    
            if (commandName === '/close') {
                if (!Channel.closed) {
                    Channel.closed = true;
                    await Channel.save();
    
                    io.to(channelId).emit('channelStatusUpdate', { closed: true });

                    const notification = await Message.create({
                        content: 'Kanal Kapatılmıştır.',
                        sender: 'system',
                        senderInfo: '673e08d210077450d8512e62',
                        channel: channelId,
                        hidden: false,
                        highlighted: true,
                        timestamp: new Date(),
                    });

                    io.to(channelId).emit('newMessage', notification);
                }
            }
    
            if (commandName === '/open') {
                if (!channel.closed) {
                    channel.closed = false;
                    await channel.save();
    
                    io.to(channelId).emit('channelStatusUpdate', { closed: false });

                    const notification = await Message.create({
                        content: 'Kanal tekrar açılmıştır.',
                        sender: 'system',
                        senderInfo: '673e08d210077450d8512e62',
                        channel: channelId,
                        hidden: false,
                        highlighted: true,
                        timestamp: new Date(),
                    });

                    io.to(channelId).emit('newMessage', notification);
                }
            }
                
            
            else {
                socket.emit('error', { message: 'Unknown command.' });
            }
        } catch (error) {
            socket.emit('error', { error: error.message });
        }
    });


    socket.on('joinChannel', (channel) => {
        socket.join(channel);
        console.log(`Kullanıcı ${socket.id} kanala katıldı: ${channel}`);
    });
    // socket.on('joinChannel', async (channelId, username) => {
    //     try {
    //         const channel = await Channel.findById(channelId).populate('allowedUsers');
    
    //         if (!channel) {
    //             return socket.emit('error', { message: 'Channel not found' });
    //         }
    
    //         const user = await User.findById(username);
    
    //         // Kanal kapalıysa sadece adminler görebilir
    //         if (channel.closed && user.role !== 'admin') {
    //             return socket.emit('error', { message: 'Channel is closed' });
    //         }
    
    //         // Kanal özelse ve kullanıcının izni yoksa
    //         if (channel.private && user.role !== 'admin' && !channel.allowedUsers.includes(username)) {
    //             return socket.emit('error', { message: 'You do not have permission to view this channel' });
    //         }
    
    //         // Kullanıcıya kanala katılmasına izin ver
    //         socket.join(channelId);
    //         socket.emit('success', { message: `Joined channel: ${channel.name}` });
    //     } catch (error) {
    //         socket.emit('error', { message: error.message });
    //     }
    // });

    socket.on('disconnect', () => {
        console.log('Bir kullanıcı bağlantısını kesti:', socket.id);
    });
});


app.post('/request-verify-code', async (req, res) => {
    const { email } = req.body;

    try {
      let existingVerification = await MailVerification.findOne({ email });
  
      if (existingVerification) {
        existingVerification.code = Math.floor(100000 + Math.random() * 900000);
        await existingVerification.save();
      }
      else {
        existingVerification = await MailVerification.create({
          email,
          code: Math.random().toString(36).substring(6),
        });
      }
  
        const mailOptions = {
            from: `${process.env.MAIL_ADRESS}`,
            to: email,
            subject: 'Private Chat | E-posta Doğrulama Kodu',
            html: `
                <div style="text-align: center;display: flex;justify-content: center;">
                    <div style="background: #f7f0e4;padding: 20px;border-radius: 25px;width: max-content;">
                        <img src="cid:logo" alt="Logo" style="width: auto; height: 100px;margin-bottom: -15px;">
                        <h1 style="color: #333;padding-bottom: 5px;border-bottom: 1px solid #aaa;">E-posta Doğrulama Kodu</h1>
                        <p style="color: #445;">Merhaba,</p>
                        <p style="color: #445;">Kaydınızı onaylamak için aşağıdaki doğrulama kodunu kullanın:</p>
                        <h2 style="color: #fff;background: #00466a;margin: 10px auto;padding: 10px;border-radius: 4px;width: max-content;letter-spacing: 10px;">${existingVerification.code}</h2>
                        <p style="color: #888;margin-top: -5px;">Doğrulama kodunu kimseyle paylaşmayın.</p>
                        <p style="color: #888;">Eğer bu e-postayı siz talep etmediyseniz, lütfen dikkate almayın.</p>
                        <hr style="border:none;border-top:1px solid #cdcdcd" />
                        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                            <p>Fiyasko Blog</p>
                        </div>
                    </div>
                </div>
            `
        };

        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log('E-posta gönderme hatası:', error);
            res.status(500).json({ error: 'E-posta gönderme hatası.' });
          } else {
            console.log('E-posta gönderildi:', info.response);
            res.status(200).json({ message: 'Doğrulama kodu başarıyla gönderildi.' });
          }
        });
      } catch (error) {
        console.error('Doğrulama kodu oluşturma hatası:', error);
        res.status(500).json({ error: 'Doğrulama kodu oluşturma hatası.' });
      }
});

app.post('/verify-email', async (req, res) => {
    const { verificationCode } = req.body;
    try {
        const verification = await MailVerification.findOne({ code: verificationCode });
        
        if (!verification) {
          return res.status(404).json({ error: 'Geçersiz doğrulama kodu.' });
        }

        await User.findOneAndUpdate({ email: verification.email }, { isVerified: true, role: 'user' });

        
        await MailVerification.deleteOne({ _id: verification._id });
        
        res.status(200).json({ message: 'E-posta adresi başarıyla doğrulandı.' });
    } catch (error) {
        console.error('Doğrulama hatası:', error);
        res.status(500).json({ error: 'Doğrulama hatası.' });
    }
});


//? Register & Login
app.post('/register', async (req, res) => {
    const { email, username, generatedUsername, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const userDoc = await User.create({
            email,
            username,
            generatedUsername: generateRandomPassword(),
            password: bcrypt.hashSync(password, salt),
            role: 'guest',
            isBanned: false,
            isVerified: false,
            premiumExpiration: Date.now(),
            userColor: 'blue',
            createdAt: Date.now(),
        });
        res.json({userDoc});
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'User registration failed' });
    }
});

function generateRandomPassword() {
    return Math.random().toString(36).slice(-8);
}

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    if (!userDoc) {
        return res.redirect('/login');
    }
    if (userDoc.isBanned) {
        return res.status(403).json({ message: 'You are banned. You cannot login.' });
    }
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
        jwt.sign(
            {
                email:userDoc.email, 
                username:userDoc.username, 
                role:userDoc.role, 
                premiumExpiration:userDoc.premiumExpiration, 
                isBanned:userDoc.isBanned, 
                id:userDoc._id
            }, secret, {}, (err, token) => {
            if (err) {
                console.error('Error generating token:', err);
                return res.status(500).send('Error generating token');
            }

            res.cookie('token', token,{
                    sameSite: "none",
                    maxAge: 24 * 60 * 60 * 1000,
                    httpOnly: false,
                    secure: true
                }).json({
                id: userDoc._id,
                email: userDoc.email,
                username: userDoc.username,
                password: userDoc.password,
                generatedUsername: userDoc.generatedUsername,
                role: userDoc.role,
                premiumExpiration: userDoc.premiumExpiration,
                isBanned: userDoc.isBanned,
                isVerified: userDoc.isVerified,
                userColor: userDoc.userColor,
            });
            console.log('token:', token);
        });
    }else {
        res.status(401).send('Unauthorized');
    }
});


app.post('/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('token').json({message: 'Logged out from all devices'});
    res.cookie('token', '', {
        sameSite: "none",
        maxAge: 0,
        httpOnly: false,
        secure: true
    });
});

//? Profile

app.get('/profile', async (req, res) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(400).json({ message: 'No token found' });
        }
        
        
        jwt.verify(token, secret, async (err, info) => {
            if (err) {
                return res.clearCookie('token').status(401).json({ message: 'Unauthorized' });
            }
            const userDoc = await User.findOne({ username: info.username })
                .select('-password')
                // .select('-username');

            if (userDoc.isBanned) {
                req.session.destroy();
                res.clearCookie('token');
                return res.status(403).json({ message: 'You are banned. You cannot access your profile.' });
            }

            
            res.json(userDoc);
        });
    } catch (e) {
        res.status(400).json(e);
    }
});

app.get('/profile/:username', async (req, res) => {
    const {username} = req.params;
    const userDoc = await User.findOne ({username})
    .select('-password')
    res.json(userDoc);
});

app.post('/change-generated-username', async (req, res) => {
    const { username } = req.body;
    try {
        const userDoc = await User.findOneAndUpdate(
            { username },
            { generatedUsername: generateRandomPassword() },
            { new: true }
        );
        res.json(userDoc);
    } catch (error) {
        console.error('Error updating generated username:', error);
        res.status(500).json({ message: 'Error updating generated username' });
    }
});


app.post('/updateColor', async (req, res) => {
    const { userId, color } = req.body;
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.userColor = color;
        await user.save();
        res.json(user);
    } catch (error) {
        console.error('Error updating user color:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

//? Channels & Messages
app.post('/channels', async (req, res) => {
    const { name } = req.body;
    try {
        const channel = await Channel.create({ name });
        res.status(201).json(channel);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/channels', async (req, res) => {
    try {
        const channels = await Channel.find();
        res.json(channels);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/messages', async (req, res) => {
    const { content, sender, senderInfo, channel } = req.body;
    try {
        const user = await User.findById(senderInfo._id);
        if (user && user.isBanned) {
            return res.status(403).json({ message: 'You are banned. Your messages cannot be sent.' });
        }

        const message = await Message.create({ 
            content, 
            sender,
            senderInfo,
            channel
        });
        res.status(201).json(message);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.get('/messages/:channelId', async (req, res) => {
    const { channelId } = req.params;
    try {
        const bannedUsers = await User.find({ isBanned: true });

        // const messages = await Message.find({ channel: channelId }).populate('sender');
        let messages = await Message.find({ channel: channelId })
            .select('-senderInfo.password')
            .select('-senderInfo.username')
            .populate({
                path: 'senderInfo',
                select: 'generatedUsername role isBanned userColor _id',
            })

            // .populate('senderInfo');

        
        messages = messages.filter(message => {
            const isSenderBanned = bannedUsers.some(user => user._id.equals(message.senderInfo._id));
            return !isSenderBanned;
        });
        
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/hideMessage/:messageId', async (req, res) => {
    const { messageId } = req.params;
    try {
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        if (message.hidden) {
            message.hidden = false;
        } else {
            message.hidden = true;
        }
        
        await message.save();
        res.status(200).json({ message: 'Message hidden change successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/highlightMessage/:messageId', async (req, res) => {
    const { messageId } = req.params;
    try {
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        if (message.highlighted) {
            message.highlighted = false;
        } else {
            message.highlighted = true;
        }
        
        await message.save();
        res.status(200).json({ message: 'Message highlighted change successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/messages/:messageId', async (req, res) => {
    const { messageId } = req.params;
    try {
        await Message.findByIdAndDelete(messageId);
        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/banUser/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        await User.findByIdAndUpdate(userId, { isBanned: true });
        res.status(200).json({ message: 'User banned successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.post('/unbanUser/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        await User.findByIdAndUpdate(userId, { isBanned: false });
        res.status(200).json({ message: 'User unbanned successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});



//? Payment
app.post('/payment', async (req, res) => {
    const { userId, price, paymentCard } = req.body;

    console.log("Gelen Ödeme Talebi:", req.body); // Bu satır eklendi

    if (!paymentCard) {
        return res.status(400).json({ message: 'PaymentCard bilgisi eksik' });
    }

    try {
        const paymentRequest = {
            locale: Iyzipay.LOCALE.TR,
            conversationId: userId,
            price: price,
            paidPrice: price,
            currency: Iyzipay.CURRENCY.TRY,
            installment: 1,
            basketId: 'B67832',
            paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
            paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
            callbackUrl: 'http://localhost:3030/payment/callback',
            buyer: {
                id: userId,
                name: 'Kullanıcı',
                surname: 'Adı',
                email: 'kullanici@example.com',
                identityNumber: '11111111111',
                registrationAddress: 'Adres',
                city: 'Şehir',
                country: 'Türkiye',
                zipCode: '34732',
            },
            shippingAddress: {
                contactName: 'Kullanıcı Adı',
                city: 'Şehir',
                country: 'Türkiye',
                address: 'Adres',
                zipCode: '34732',
            },
            billingAddress: {
                contactName: 'Kullanıcı Adı',
                city: 'Şehir',
                country: 'Türkiye',
                address: 'Adres',
                zipCode: '34732',
            },
            basketItems: [
                {
                    id: 'BI101',
                    name: 'Premium Üyelik',
                    category1: 'Üyelik',
                    itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
                    price: price,
                },
            ],
            paymentCard, // Bu alan eklendi
        };

        iyzipay.payment.create(paymentRequest, async (err, result) => {
            if (err || result.status !== 'success') {
                console.error("Ödeme Hatası:", err || result);
                return res.status(400).json({ message: 'Ödeme başarısız', error: err || result });
            }

            // Kullanıcıyı premium yap
            const premiumExpiration = new Date();
            premiumExpiration.setMonth(premiumExpiration.getMonth() + 1);
            await User.findByIdAndUpdate(userId, { role: 'premium', premiumExpiration });

            res.status(200).json({ message: 'Ödeme başarılı, Premium aktif edildi', result });
        });
    } catch (error) {
        console.error("Sunucu Hatası:", error);
        res.status(500).json({ message: 'Bir hata oluştu', error });
    }
});


//! Listen to port 3030
// app.listen(3030, () => {
//     console.log('Server listening on port 3030 || nodemon index.js')
// });
server.listen(3030, () => {
    console.log('Server listening on port 3030 || nodemon index.js');
});