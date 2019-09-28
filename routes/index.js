const express = require('express');
const router = express.Router();
const Room = require('../schemas/room');
const Chat = require('../schemas/chat');

router.get('/', (req, res) => {
    try{
        const rooms = await Room.find({});
        res.render('main', {rooms, title: 'GIF CHAT', error: req.flash('roomError')})
    }catch (err) {
        console.error(err);
        next(err)
    }
});

router.get('/room', (req, res) => {
    res.render('/room', {title: 'GIF CHAT ROOM IS CREATED'})
});

router.post('/room', async (req, res, next) => {
    try{
        const room = new Room({
            title: req.body.title,
            max: req.body.max,
            owner: req.session.color,
            password: req.body.password
        });
        const newRoom = await room.save();
        const io = req.app.get('io');
        io.of('/room').emit('newRoom', newRoom);
        res.redirect(`/room/${newRoom._id}?password=${req.body.password}`)
    } catch(err) {
        console.error(err);
        next(err);
    }
})

router.get('/room/:id', async (req, res, next) => {
    try{
        const room = await Room.findOne({_id: req.params.id});
        const io = req.app.get('io');
        if(!room) {
            req.flash('roomError', 'Room does not exist..');
            return res.redirect('/')
        }
        if(room.password && room.password !== req.query.password) {
            req.flash('roomError', 'Password does not match');
            return res.redirect('/')
        }
        const { rooms } = io.of('/chat').adapter;
        if(rooms && rooms[req.params.id] && room.max < rooms[req.params.id].length) {
            req.flash('roomError', 'Too many people are in the room');
            return res.redirect('/');
        }
        return res.render('chat', {
            room,
            title: room.title,
            chats: [],
            user: req.session.color
        })
    } catch(err) {
        console.error(error);
        return next(error);
    }
});

router.delete('/room/:id', async(req, res, next) => {
    try{
        await Room.remove({_id: req.params.id});
        await Chat.remove({room: req.params.id});
        res.send('ok');
        setTimeout(() => {
            req.app.get('io').of('/room').emit('removeRoom', req.params.id);
        }, 2000);
    } catch(err) {
        console.error(err);
        next(err)
    }
})

module.exports = router;

