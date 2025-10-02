export default async function handler(req,res){ try { 
if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
const { script='', voice='alloy' } = req.body||{};
if(!script) return res.status(200).json({ audioUrl: '' });
try{ const OpenAI=(await import('openai')).default; const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); const out = await client.audio.speech.create({ model:'gpt-4o-mini-tts', voice, input:script, format:'mp3' }); const buf = Buffer.from(await out.arrayBuffer()); return res.status(200).json({ audioUrl: 'data:audio/mpeg;base64,'+buf.toString('base64') }); } catch(e){ return res.status(200).json({ audioUrl:'', error:e?.message||'tts error' }); }
 } catch(e){ console.error(e); if(!res.headersSent) res.status(200).json({ error: e?.message || 'Unexpected error' }); } }