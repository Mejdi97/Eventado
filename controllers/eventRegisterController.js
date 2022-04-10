var mongoose = require('mongoose');
const express = require('express');
const event = require('../models/event');
const User = require('../models/user');
const EventRegister = require('../models/eventRegister');
const eventRegister = require('../models/eventRegister');



exports.create = async (req, res) => {
    const event_id =  req.body.event_id;
    const user_id = req.body.user_id;
    const Event = await event.findById(event_id);
   
    const user = await User.findById(user_id);
    if (!Event){
         return res.status(404).send({message : 'Event is not found'})
    }
    
    if (!user) return res.status(404).send({message :'User is not register'})

    let eventRegister = new EventRegister({
        user: user_id,
        event: event_id
    })
    eventRegister = await eventRegister.save();
  

    res.send(eventRegister)
}



exports.getByUser = async (req, res) =>{
    
    try {
        const EventRegister = await EventRegister.find({ event_id: req.body.event_id });
      
        res.status(200).json(EventRegister);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

