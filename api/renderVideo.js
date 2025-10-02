export default async function handler(req,res){ try { 
if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
const { format='reel', headline='Title', imageUrl='', audioUrl='', paletteColor='#8A5BFF' } = req.body||{};
if(!imageUrl) return res.status(400).json({ error: 'imageUrl required (use the rendered image URL)' });
const { videoTemplate } = await import('../../lib/templates.js'); const { ssFetch } = await import('../../lib/shotstack.js');
const aspect = format==='wide'?'16:9':(format==='square'?'1:1':'9:16');
let base = videoTemplate(aspect);
let s = JSON.stringify(base).replaceAll('{{headline}}', String(headline).slice(0,60)).replaceAll('{{paletteColor}}', paletteColor).replaceAll('{{imageUrl}}', imageUrl).replaceAll('{{audioUrl}}', audioUrl||'');
const edit = JSON.parse(s);
const data = await ssFetch('/edit/{env}/render', edit);
const id = data?.response?.id || data?.id || data?.data?.id || null;
return res.status(200).json({ id, response: data });
 } catch(e){ console.error(e); if(!res.headersSent) res.status(200).json({ error: e?.message || 'Unexpected error' }); } }