const mongoose = require('mongoose');

// Vereinfachtes Schema, um Validierungsprobleme zu vermeiden
const messageSchema = new mongoose.Schema({
  figure: {
    id: String,
    name: String,
    image: String
  },
  text: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { strict: false }); // Weniger strikte Validierung

const chatSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    default: 'Neues Gespräch'
  },
  figures: [{
    id: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    }
  }],
  messages: [messageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
});

// Virtuals
chatSchema.virtual('lastMessage').get(function() {
  if (this.messages && this.messages.length > 0) {
    return this.messages[this.messages.length - 1];
  }
  return null;
});

// Middleware
chatSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Methoden
chatSchema.methods.addMessage = function(message) {
  this.messages.push(message);
  this.updatedAt = Date.now();
  return this.save();
};

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;