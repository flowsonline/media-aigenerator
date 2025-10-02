export default async function handler(req,res){ try { 
if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
const { template='static', headline='Your Headline', caption='', paletteColor='#8A5BFF' } = req.body||{};
const { staticTemplate } = await import('../../lib/templates.js'); const { ssFetch } = await import('../../lib/shotstack.js');
const base = staticTemplate();
const edit = JSON.parse(JSON.stringify(base).replaceAll('{{headline}}', String(headline).slice(0,60)).replaceAll('{{paletteColor}}', paletteColor).replaceAll('{{caption}}', caption||''));
const data = await ssFetch('/edit/{env}/render', edit);
const id = data?.response?.id || data?.id || data?.data?.id || null;
return res.status(200).json({ id, response: data });
 } catch(e){ console.error(e); if(!res.headersSent) res.status(200).json({ error: e?.message || 'Unexpected error' }); } }