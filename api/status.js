export default async function handler(req,res){ try { 
const { id } = req.query; if(!id) return res.status(400).json({error:'id required'});
const { getBase } = await import('../../lib/shotstack.js'); const { host, env } = getBase();
const url = `${host}/edit/${env}/render/${id}`; const r = await fetch(url,{ headers:{ 'x-api-key': process.env.SHOTSTACK_API_KEY || '' } }); const t = await r.text(); let data; try{ data = JSON.parse(t); } catch { data={ raw:t }; }
const st = data?.response?.status || data?.status || 'unknown'; const u = data?.response?.url || data?.url || data?.data?.output?.url || null;
return res.status(200).json({ status: st, url: u, raw: data });
 } catch(e){ console.error(e); if(!res.headersSent) res.status(200).json({ error: e?.message || 'Unexpected error' }); } }