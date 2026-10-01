import {createPreviewServer} from './server/preview-server.mjs';
import {createChatService} from './server/chat-service.mjs';
const port=Number(process.env.YARDU_PORT||4319);
const chat=createChatService({apiKey:process.env.GROQ_API_KEY||'',enabled:process.env.YARDU_CHAT_ENABLE_GROQ==='1',freePlanConfirmed:process.env.YARDU_GROQ_FREE_PLAN_CONFIRMED==='1'});
createPreviewServer({chat}).listen(port,'127.0.0.1',()=>console.log(`YardU local preview: http://localhost:${port}`));
