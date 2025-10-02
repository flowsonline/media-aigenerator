import { useState, useEffect } from 'react';
import Image from 'next/image';
export async function getServerSideProps(){ return { props: {} }; }
async function api(path, init){ const r = await fetch(path, init); const t = await r.text(); try { return JSON.parse(t);} catch { throw new Error(t || 'Unexpected'); } }
export default function Home(){
  const [step,setStep]=useState(0),[busy,setBusy]=useState(false),[err,setErr]=useState('');
  const [industry,setIndustry]=useState('Tech'),[goal,setGoal]=useState('Awareness'),[tone,setTone]=useState('Energetic'),[platform,setPlatform]=useState('Instagram Reel 9:16');
  const [description,setDescription]=useState('Discover powerful, easy-to-use AI tools designed for everyone — from creators and entrepreneurs to educators and innovators. Explore features, benefits, and pricing at a glance, and see how FLOWS ALPHA can transform the way you work, create, and grow.');
  const [voice,setVoice]=useState('alloy'),[includeTTS,setIncludeTTS]=useState(true);
  const [headline,setHeadline]=useState(''),[caption,setCaption]=useState(''),[hashtags,setHashtags]=useState([]),[script,setScript]=useState(''),[audio,setAudio]=useState('');
  const [imageUrl,setImageUrl]=useState(''),[videoUrl,setVideoUrl]=useState(''); const [imageJob,setImageJob]=useState(''),[videoJob,setVideoJob]=useState('');
  function clear(){ setErr(''); }
  async function compose(){ setErr(''); setBusy(true); try{ const j=await api('/api/compose',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({industry,goal,tone,platform,description})}); setHeadline(j.headline); setCaption(j.caption); setHashtags(j.hashtags||[]); setScript(j.script||''); setStep(1);}catch(e){setErr(String(e.message||e))} finally{setBusy(false)} }
  async function tts(){ if(!includeTTS) return setStep(2); setBusy(true); setErr(''); try{ const j=await api('/api/tts',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({script,voice})}); setAudio(j.audioUrl||''); setStep(2);}catch(e){setErr(String(e.message||e))} finally{setBusy(false)} }
  async function renderImage(){ setBusy(true); setErr(''); try{ const j=await api('/api/renderTemplate',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({template:'static',headline,caption,paletteColor:'#8A5BFF'})}); setImageJob(j.id||''); setStep(3);}catch(e){setErr(String(e.message||e))} finally{setBusy(false)} }
  async function assembleVideo(){ setBusy(true); setErr(''); try{ const j=await api('/api/renderVideo',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({format:'reel',headline,imageUrl,audioUrl:audio,paletteColor:'#8A5BFF'})}); setVideoJob(j.id||''); setStep(4);}catch(e){setErr(String(e.message||e))} finally{setBusy(false)} }
  useEffect(()=>{ if(!imageJob||imageUrl) return; let t; async function poll(){ try{ const j=await api('/api/status?id='+imageJob); if(j.status==='done'&&j.url){ setImageUrl(j.url); return; } }catch{} t=setTimeout(poll,3500);} poll(); return()=>clearTimeout(t); },[imageJob,imageUrl]);
  useEffect(()=>{ if(!videoJob||videoUrl) return; let t; async function poll(){ try{ const j=await api('/api/status?id='+videoJob); if(j.status==='done'&&j.url){ setVideoUrl(j.url); return; } }catch{} t=setTimeout(poll,3500);} poll(); return()=>clearTimeout(t); },[videoJob,videoUrl]);
  return (<div className="container">
    <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:10}}><Image src="/orion.svg" alt="Orion" width={32} height={32}/><div><div className="h1">Orion — AI Social Media Agent</div><div className="sub">Answer a few prompts; I’ll deliver copy + media.</div></div></div>
    <div className="panel">
      <div className="step">Step {step}</div>
      {err && <div className="err">{err}</div>}
      {step===0 && (<div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
          <div><div className="sub">Industry</div><select className="select" value={industry} onChange={e=>setIndustry(e.target.value)}>{['Tech','Beauty','Retail','Food & Beverage'].map(x=><option key={x}>{x}</option>)}</select></div>
          <div><div className="sub">Goal</div><select className="select" value={goal} onChange={e=>setGoal(e.target.value)}>{['Awareness','Traffic','Conversions'].map(x=><option key={x}>{x}</option>)}</select></div>
          <div><div className="sub">Tone</div><select className="select" value={tone} onChange={e=>setTone(e.target.value)}>{['Energetic','Elegant','Commercial'].map(x=><option key={x}>{x}</option>)}</select></div>
          <div><div className="sub">Platform</div><select className="select" value={platform} onChange={e=>setPlatform(e.target.value)}>{['Instagram Reel 9:16','Square 1:1','Wide 16:9'].map(x=><option key={x}>{x}</option>)}</select></div>
        </div>
        <div className="sub" style={{marginTop:10}}>Motive / Description</div>
        <textarea className="textarea" value={description} onChange={e=>setDescription(e.target.value)} />
        <div style={{display:'flex',gap:10,marginTop:14}}>
          <label><input type="checkbox" checked={includeTTS} onChange={e=>setIncludeTTS(e.target.checked)} /> Include voiceover script & TTS preview</label>
          <select className="select" value={voice} onChange={e=>setVoice(e.target.value)} style={{maxWidth:200}}>{['alloy','aria','coral','sage'].map(v=><option key={v}>{v}</option>)}</select>
        </div>
        <button className="btn" disabled={busy} onClick={compose} style={{marginTop:14}}>Create copy</button>
      </div>)}
      {step===1 && (<div>
        <div style={{fontWeight:700,marginBottom:8}}>Here’s your copy. Generate visuals?</div>
        <div>Headline: <b>{headline}</b></div>
        <div>Caption: {caption}</div>
        <div>Hashtags: {(hashtags||[]).join(' ')}</div>
        <div>Script: {script}</div>
        <button className="btn" disabled={busy} onClick={tts} style={{marginTop:14}}>Generate TTS</button>
      </div>)}
      {step===2 && (<div>
        <div style={{fontWeight:700,marginBottom:8}}>Voiceover ready (preview below). Assemble video?</div>
        {audio && <audio controls src={audio} style={{width:'100%',margin:'8px 0'}}/>}
        <div className="sub">To include audio in the final render, paste a public https MP3 URL. Upload route can be added later.</div>
        <button className="btn" disabled={busy} onClick={renderImage} style={{marginTop:14}}>Generate image</button>
      </div>)}
      {step===3 && (<div>
        <div className="preview">{imageUrl ? <img src={imageUrl} style={{maxWidth:'100%',maxHeight:300}}/> : <span>Rendering image...</span>}</div>
        <div style={{display:'flex',gap:10,marginTop:12}}>
          <button className="btn" disabled={!imageUrl||busy} onClick={assembleVideo}>Assemble video</button>
        </div>
      </div>)}
      {step===4 && (<div>
        <div className="preview">{videoUrl ? <video controls src={videoUrl} style={{maxWidth:'100%',maxHeight:320}}/> : <span>Rendering video...</span>}</div>
      </div>)}
    </div>
  </div>);
}
