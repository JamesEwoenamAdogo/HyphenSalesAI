import openai from "../Config/OpenAiConfig.js";

import Conversation from "../Models/Conversation.js";
import Message from "../Models/Message.js";



export const sendChatMessage = async (req, res) => {

  try {

    const {
      conversationId,
      message
    } = req.body;


    const userId = req.user.id;



    let conversation;



    // Create new conversation if none exists
    if (!conversationId) {

      conversation = await Conversation.create({
        userId,
      });

    } else {

      conversation =
        await Conversation.findById(conversationId);

    }



    if (!conversation) {

      return res.status(404).json({
        success:false,
        message:"Conversation not found"
      });

    }




    // Save user message

    await Message.create({

      conversationId: conversation._id,

      role:"user",

      content:message

    });






    // Get previous messages

    const previousMessages =
      await Message.find({
        conversationId:conversation._id
      })
      .sort({
        createdAt:1
      });






    const messages = [

      {
        role:"system",

        content:
        `
        You are Hyphen Sales AI.
        You help businesses sell products,
        answer customer questions,
        recommend products,
        and convert leads.
        `
      },


      ...previousMessages.map(msg => ({
        role:msg.role,
        content:msg.content
      }))

    ];






    // Send to OpenAI

    const completion =
      await openai.chat.completions.create({

        model:"gpt-4.1-mini",

        messages,

        temperature:0.7

      });





    const aiReply =
      completion.choices[0]
      .message
      .content;






    // Save AI response

    await Message.create({

      conversationId:conversation._id,

      role:"assistant",

      content:aiReply

    });





    return res.status(200).json({

      success:true,

      conversationId:
      conversation._id,

      reply:aiReply

    });



  } catch(error){

    console.error(
      "Chat Error:",
      error
    );


    return res.status(500).json({

      success:false,

      message:"AI response failed"

    });

  }

};