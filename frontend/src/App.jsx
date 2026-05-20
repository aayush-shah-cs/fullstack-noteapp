import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
// ─── DATA ─────────────────────────────────────────────────────────────────────
const COLORS = [
  { id:'yellow', bg:'#fef9c3', border:'#fde047', text:'#713f12' },
  { id:'pink',   bg:'#fce7e7', border:'#fca5a5', text:'#7f1d1d' },
  { id:'blue',   bg:'#dbeafe', border:'#93c5fd', text:'#1e3a5f' },
  { id:'green',  bg:'#d1fae5', border:'#6ee7b7', text:'#064e3b' },
  { id:'purple', bg:'#ede9fe', border:'#c4b5fd', text:'#4c1d95' },
  { id:'orange', bg:'#ffedd5', border:'#fdba74', text:'#7c2d12' },
]

const initFolders = [
  { id:'f1', name:'Movie Review', color:'blue',   noteCount:3, created:'12/12/2024' },
  { id:'f2', name:'Class Notes',  color:'orange',  noteCount:5, created:'12/12/2024' },
  { id:'f3', name:'Book Lists',   color:'yellow', noteCount:2, created:'12/12/2024' },
]

const initNotes = [
  { id:'n1', folderId:'f1', title:'Mid test exam',  body:'Ultrices viverra odio congue lacos felis, libero egestas nunc sagi are masa, elit ornare eget sem velo in ulom. In augue cursus of adipicing felis, diam volutpat mauris, id and.', color:'yellow', pinned:false, archived:false, trashed:false, created: new Date(2024,11,15,22,30) },
  { id:'n2', folderId:'f2', title:'Mid test exam',  body:'Ultrices viverra odio congue lacos felis, libero egestas nunc sagi are masa, elit ornare eget sem velo in ulom. In augue cursus of adipicing felis, diam volutpat mauris, id and.', color:'pink',   pinned:false, archived:false, trashed:false, created: new Date(2024,11,13,22,30) },
  { id:'n3', folderId:null, title:"Jonas's notes",  body:'Rokity viverra odio congue lacos felis, libero egestas nunc sagi are masa, elit ornare eget sem velo in ulom.',                                                                              color:'blue',   pinned:true,  archived:false, trashed:false, created: new Date(2024,11,11,20,23) },
]

function fmt(d){ return d.toLocaleDateString('en-US',{month:'2-digit',day:'2-digit',year:'numeric'}) }
function fmtTime(d){ return d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}) + ', ' + d.toLocaleDateString('en-US',{weekday:'long'}) }
function uid(){ return Math.random().toString(36).slice(2) }
function colorObj(id){ return COLORS.find(c=>c.id===id)||COLORS[0] }

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }){
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.35)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{background:'#fff',borderRadius:20,width:'100%',maxWidth:480,boxShadow:'0 20px 60px rgba(0,0,0,0.15)',overflow:'hidden'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'20px 24px 16px',borderBottom:'1px solid #f0f0f0'}}>
          <span style={{fontWeight:700,fontSize:16,color:'#1a1a2e'}}>{title}</span>
          <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',fontSize:20,color:'#94a3b8',lineHeight:1}}>✕</button>
        </div>
        <div style={{padding:'20px 24px 24px'}}>{children}</div>
      </div>
    </div>
  )
}

// ─── NOTE EDITOR MODAL ────────────────────────────────────────────────────────
function NoteModal({ note, folders, onSave, onClose }){
  const isNew = !note
  const [title,setTitle]     = useState(note?.title||'')
  const [body,setBody]       = useState(note?.body||'')
  const [color,setColor]     = useState(note?.color||'yellow')
  const [folderId,setFolder] = useState(note?.folderId||'')
  const c = colorObj(color)
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.35)',zIndex:9999,display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'}}>
      <div style={{background:c.bg,borderRadius:20,width:'100%',maxWidth:560,boxShadow:'0 20px 60px rgba(0,0,0,0.15)',overflow:'hidden',border:`1.5px solid ${c.border}`}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 20px 14px',borderBottom:`1px solid ${c.border}`}}>
          <span style={{fontWeight:700,fontSize:15,color:c.text}}>{isNew ? 'New note' : 'Edit note'}</span>
          <div style={{display:'flex',gap:8}}>
            {COLORS.map(cl=>(
              <button key={cl.id} onClick={()=>setColor(cl.id)} style={{width:18,height:18,borderRadius:'50%',background:cl.bg,border:color===cl.id?`2.5px solid ${cl.text}`:`1.5px solid ${cl.border}`,cursor:'pointer'}}/>
            ))}
            <button onClick={onClose} style={{background:'none',border:'none',cursor:'pointer',fontSize:18,color:c.text,marginLeft:8,lineHeight:1}}>✕</button>
          </div>
        </div>
        <div style={{padding:'16px 20px'}}>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" style={{width:'100%',background:'transparent',border:'none',outline:'none',fontWeight:700,fontSize:17,color:c.text,marginBottom:12,fontFamily:'inherit'}}/>
          <textarea value={body} onChange={e=>setBody(e.target.value)} placeholder="Write your note here…" rows={7} style={{width:'100%',background:'transparent',border:'none',outline:'none',fontSize:14,color:c.text,resize:'vertical',fontFamily:'inherit',lineHeight:1.7}}/>
          <div style={{marginTop:12,display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:12,color:c.text,opacity:0.6}}>Folder:</span>
            <select value={folderId} onChange={e=>setFolder(e.target.value)} style={{fontSize:13,border:`1px solid ${c.border}`,borderRadius:8,padding:'4px 8px',background:c.bg,color:c.text,outline:'none'}}>
              <option value=''>None</option>
              {folders.map(f=><option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
        </div>
        <div style={{padding:'0 20px 20px',display:'flex',justifyContent:'flex-end',gap:8}}>
          <button onClick={onClose} style={{padding:'8px 18px',borderRadius:10,border:`1px solid ${c.border}`,background:'transparent',color:c.text,fontSize:13,cursor:'pointer',fontWeight:500}}>Cancel</button>
          <button onClick={()=>{ if(title.trim()||body.trim()) onSave({title:title.trim()||'Untitled',body,color,folderId:folderId||null}); onClose() }}
            style={{padding:'8px 20px',borderRadius:10,border:'none',background:c.text,color:'#fff',fontSize:13,cursor:'pointer',fontWeight:600}}>Save</button>
        </div>
      </div>
    </div>
  )
}

// ─── FOLDER MODAL ─────────────────────────────────────────────────────────────
function FolderModal({ folder, onSave, onClose }){
  const [name,setName] = useState(folder?.name||'')
  const [color,setColor] = useState(folder?.color||'blue')
  return (
    <Modal title={folder ? 'Edit folder' : 'New folder'} onClose={onClose}>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Folder name" style={{width:'100%',padding:'10px 14px',borderRadius:10,border:'1.5px solid #e2e8f0',outline:'none',fontSize:14,marginBottom:16}}/>
      <div style={{display:'flex',gap:10,marginBottom:20}}>
        {COLORS.map(cl=>(
          <button key={cl.id} onClick={()=>setColor(cl.id)} style={{width:28,height:28,borderRadius:'50%',background:cl.bg,border:color===cl.id?`3px solid ${cl.text}`:`1.5px solid ${cl.border}`,cursor:'pointer'}}/>
        ))}
      </div>
      <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
        <button onClick={onClose} style={{padding:'8px 18px',borderRadius:10,border:'1px solid #e2e8f0',background:'transparent',color:'#64748b',fontSize:13,cursor:'pointer'}}>Cancel</button>
        <button onClick={()=>{ if(name.trim()) onSave({name:name.trim(),color}); onClose() }}
          style={{padding:'8px 20px',borderRadius:10,border:'none',background:'#4f46e5',color:'#fff',fontSize:13,cursor:'pointer',fontWeight:600}}>Save</button>
      </div>
    </Modal>
  )
}

// ─── NOTE CARD ────────────────────────────────────────────────────────────────
function NoteCard({ note, onEdit, onPin, onArchive, onTrash, onRestore, onDelete, trashed, archived }){
  const [menu,setMenu] = useState(false)
  const c = colorObj(note.color)
  const ref = useRef()
  useEffect(()=>{
    if(!menu) return
    const handler = e=>{ if(ref.current && !ref.current.contains(e.target)) setMenu(false) }
    document.addEventListener('mousedown',handler)
    return ()=>document.removeEventListener('mousedown',handler)
  },[menu])
  return (
    <div style={{background:c.bg,borderRadius:16,padding:18,border:`1px solid ${c.border}`,display:'flex',flexDirection:'column',gap:8,position:'relative',transition:'transform 0.15s',cursor:'pointer'}}
      onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
      onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}
      onClick={()=>!trashed&&!archived&&onEdit(note)}>
      {note.pinned && <span style={{fontSize:10,background:'#4f46e5',color:'#fff',padding:'2px 7px',borderRadius:20,width:'fit-content',fontWeight:600}}>Pinned</span>}
      <div style={{fontSize:11,color:c.text,opacity:0.55}}>{fmt(note.created)}</div>
      <div style={{fontWeight:700,fontSize:15,color:c.text,lineHeight:1.3}}>{note.title}</div>
      <div style={{fontSize:12,color:c.text,opacity:0.65,lineHeight:1.6,flex:1,overflow:'hidden',display:'-webkit-box',WebkitLineClamp:4,WebkitBoxOrient:'vertical'}}>{note.body}</div>
      <div style={{display:'flex',alignItems:'center',gap:6,marginTop:4,fontSize:11,color:c.text,opacity:0.5}}>
        <span>🕐</span><span>{fmtTime(note.created)}</span>
      </div>
      <div ref={ref} style={{position:'absolute',top:12,right:12}} onClick={e=>e.stopPropagation()}>
        <button onClick={()=>setMenu(m=>!m)} style={{background:'rgba(255,255,255,0.5)',border:'none',borderRadius:8,width:28,height:28,cursor:'pointer',fontSize:14,color:c.text}}>⋯</button>
        {menu && (
          <div style={{position:'absolute',right:0,top:32,background:'#fff',borderRadius:12,boxShadow:'0 4px 24px rgba(0,0,0,0.12)',padding:'6px',zIndex:99,minWidth:140}}>
            {!trashed && !archived && <>
              <button onClick={()=>{onEdit(note);setMenu(false)}} style={mStyle}>✏️ Edit</button>
              <button onClick={()=>{onPin(note.id);setMenu(false)}} style={mStyle}>{note.pinned?'📌 Unpin':'📌 Pin'}</button>
              <button onClick={()=>{onArchive(note.id);setMenu(false)}} style={mStyle}>📦 Archive</button>
              <button onClick={()=>{onTrash(note.id);setMenu(false)}} style={{...mStyle,color:'#ef4444'}}>🗑 Trash</button>
            </>}
            {archived && <>
              <button onClick={()=>{onRestore(note.id);setMenu(false)}} style={mStyle}>↩️ Restore</button>
              <button onClick={()=>{onTrash(note.id);setMenu(false)}} style={{...mStyle,color:'#ef4444'}}>🗑 Trash</button>
            </>}
            {trashed && <>
              <button onClick={()=>{onRestore(note.id);setMenu(false)}} style={mStyle}>↩️ Restore</button>
              <button onClick={()=>{onDelete(note.id);setMenu(false)}} style={{...mStyle,color:'#ef4444'}}>❌ Delete forever</button>
            </>}
          </div>
        )}
      </div>
    </div>
  )
}
const mStyle={display:'block',width:'100%',textAlign:'left',background:'transparent',border:'none',padding:'8px 12px',borderRadius:8,fontSize:13,cursor:'pointer',color:'#374151'}

// ─── FOLDER CARD ──────────────────────────────────────────────────────────────
function FolderCard({ folder, onClick, onEdit, onDelete }){
  const [menu,setMenu] = useState(false)
  const ref = useRef()
  const c = colorObj(folder.color)
  useEffect(()=>{
    if(!menu) return
    const h = e=>{ if(ref.current&&!ref.current.contains(e.target)) setMenu(false) }
    document.addEventListener('mousedown',h)
    return ()=>document.removeEventListener('mousedown',h)
  },[menu])
  return (
    <div style={{background:c.bg,borderRadius:16,padding:16,border:`1px solid ${c.border}`,cursor:'pointer',minHeight:110,display:'flex',flexDirection:'column',justifyContent:'space-between',position:'relative',transition:'transform 0.15s'}}
      onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
      onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}
      onClick={()=>onClick(folder)}>
      <div>
        <div style={{width:38,height:38,borderRadius:10,background:'rgba(255,255,255,0.55)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,marginBottom:8}}>📁</div>
        <div style={{fontWeight:700,fontSize:14,color:c.text}}>{folder.name}</div>
        <div style={{fontSize:11,color:c.text,opacity:0.55,marginTop:2}}>{folder.noteCount} notes · {folder.created}</div>
      </div>
      <div ref={ref} style={{position:'absolute',top:10,right:10}} onClick={e=>e.stopPropagation()}>
        <button onClick={()=>setMenu(m=>!m)} style={{background:'rgba(255,255,255,0.5)',border:'none',borderRadius:8,width:26,height:26,cursor:'pointer',fontSize:13,color:c.text}}>⋯</button>
        {menu&&(
          <div style={{position:'absolute',right:0,top:30,background:'#fff',borderRadius:12,boxShadow:'0 4px 24px rgba(0,0,0,0.12)',padding:'6px',zIndex:99,minWidth:130}}>
            <button onClick={()=>{onEdit(folder);setMenu(false)}} style={mStyle}>✏️ Edit</button>
            <button onClick={()=>{onDelete(folder.id);setMenu(false)}} style={{...mStyle,color:'#ef4444'}}>🗑 Delete</button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────
function Sidebar({ open, view, setView, onAddNote, onClose }){
  const items = [
    {id:'home',    icon:'🏠', label:'My Notes'},
    {id:'calendar',icon:'📅', label:'Calendar'},
    {id:'archive', icon:'📦', label:'Archive'},
    {id:'trash',   icon:'🗑', label:'Trash'},
  ]
  return (
    <>
      {open && <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.2)',zIndex:149,display:'none'}} className="sb-overlay"/>}
      <aside style={{position:'fixed',top:0,left:0,height:'100%',width:220,background:'#fff',borderRight:'1px solid #f0f0f8',display:'flex',flexDirection:'column',padding:'24px 14px',zIndex:200,transition:'transform 0.3s',transform:open?'translateX(0)':'translateX(-100%)',boxShadow:'2px 0 16px rgba(0,0,0,0.06)'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:28,paddingLeft:6}}>
          <div style={{width:28,height:28,borderRadius:'50%',background:'#4f46e5',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:13,fontWeight:800}}>M</div>
          <span style={{fontWeight:900,fontSize:16,letterSpacing:2,color:'#1a1a2e'}}>NEXNOTE</span>
        </div>
        <button onClick={onAddNote} style={{display:'flex',alignItems:'center',gap:10,padding:'11px 14px',borderRadius:12,background:'#4f46e5',border:'none',color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer',marginBottom:16,width:'100%'}}>
          <span style={{fontSize:18}}>+</span> Add New Note
        </button>
        <nav style={{display:'flex',flexDirection:'column',gap:2}}>
          {items.map(it=>(
            <button key={it.id} onClick={()=>{setView(it.id);onClose()}}
              style={{display:'flex',alignItems:'center',gap:10,padding:'10px 14px',borderRadius:12,border:'none',cursor:'pointer',fontSize:14,fontWeight:500,textAlign:'left',background:view===it.id?'#e0e7ff':'transparent',color:view===it.id?'#4f46e5':'#64748b',transition:'all 0.15s'}}>
              <span style={{fontSize:17}}>{it.icon}</span>{it.label}
            </button>
          ))}
        </nav>
        <div style={{marginTop:'auto',background:'#4f46e5',borderRadius:14,padding:16,color:'#fff',textAlign:'center'}}>
          <p style={{fontSize:12,opacity:0.85,lineHeight:1.5,marginBottom:10}}>Unlock unlimited notes & features</p>
          <button style={{width:'100%',background:'#fff',color:'#4f46e5',border:'none',borderRadius:8,padding:'8px 0',fontSize:12,fontWeight:700,cursor:'pointer'}}>Upgrade Pro</button>
        </div>
      </aside>
    </>
  )
}

// ─── TABS ─────────────────────────────────────────────────────────────────────
function Tabs({ tabs, active, onChange }){
  return (
    <div style={{display:'flex',gap:4,marginBottom:16}}>
      {tabs.map(t=>(
        <button key={t} onClick={()=>onChange(t)} style={{fontSize:13,fontWeight:active===t?700:500,color:active===t?'#4f46e5':'#94a3b8',background:active===t?'#ede9fe':'transparent',border:'none',padding:'6px 14px',borderRadius:8,cursor:'pointer',transition:'all 0.15s'}}>{t}</button>
      ))}
    </div>
  )
}

// ─── CALENDAR VIEW ────────────────────────────────────────────────────────────
function CalendarView({ notes }){
  const [cur,setCur] = useState(new Date())
  const year = cur.getFullYear(), month = cur.getMonth()
  const firstDay = new Date(year,month,1).getDay()
  const daysInMonth = new Date(year,month+1,0).getDate()
  const cells = []
  for(let i=0;i<firstDay;i++) cells.push(null)
  for(let d=1;d<=daysInMonth;d++) cells.push(d)
  const notesByDay = {}
  notes.filter(n=>!n.archived&&!n.trashed).forEach(n=>{
    if(n.created.getFullYear()===year && n.created.getMonth()===month){
      const d = n.created.getDate()
      if(!notesByDay[d]) notesByDay[d]=[]
      notesByDay[d].push(n)
    }
  })
  const today = new Date()
  const months=['January','February','March','April','May','June','July','August','September','October','November','December']
  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
        <button onClick={()=>setCur(new Date(year,month-1,1))} style={{background:'none',border:'1px solid #e2e8f0',borderRadius:8,padding:'4px 10px',cursor:'pointer',fontSize:16}}>‹</button>
        <span style={{fontWeight:700,fontSize:16,color:'#1a1a2e'}}>{months[month]} {year}</span>
        <button onClick={()=>setCur(new Date(year,month+1,1))} style={{background:'none',border:'1px solid #e2e8f0',borderRadius:8,padding:'4px 10px',cursor:'pointer',fontSize:16}}>›</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4,marginBottom:6}}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>(
          <div key={d} style={{textAlign:'center',fontSize:12,fontWeight:600,color:'#94a3b8',padding:'4px 0'}}>{d}</div>
        ))}
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:4}}>
        {cells.map((d,i)=>{
          const isToday = d && today.getDate()===d && today.getMonth()===month && today.getFullYear()===year
          const dayNotes = d ? (notesByDay[d]||[]) : []
          return (
            <div key={i} style={{minHeight:70,borderRadius:10,background:d?(isToday?'#ede9fe':'#f8f8ff'):'transparent',border:d?'1px solid #e8e8f0':'none',padding:'6px',cursor:d?'default':'default'}}>
              {d&&<>
                <div style={{fontSize:13,fontWeight:isToday?700:400,color:isToday?'#4f46e5':'#374151'}}>{d}</div>
                <div style={{marginTop:2,display:'flex',flexDirection:'column',gap:2}}>
                  {dayNotes.slice(0,2).map(n=>(
                    <div key={n.id} style={{fontSize:10,background:colorObj(n.color).bg,color:colorObj(n.color).text,borderRadius:4,padding:'1px 5px',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{n.title}</div>
                  ))}
                  {dayNotes.length>2&&<div style={{fontSize:10,color:'#94a3b8'}}>+{dayNotes.length-2} more</div>}
                </div>
              </>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App(){
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [view, setView]               = useState('home')
  const [search, setSearch]           = useState('')
  const [notes, setNotes] = useState([])
  const [folders, setFolders]         = useState(initFolders)
  const [noteModal, setNoteModal]     = useState(null) // null | 'new' | noteObj
  const [folderModal, setFolderModal] = useState(null) // null | 'new' | folderObj
  const [activeFolder, setActiveFolder] = useState(null)
  const [folderTab, setFolderTab]     = useState('This Week')
  const [noteTab, setNoteTab]         = useState('Todays')
  const [colorFilter, setColorFilter] = useState(null)

  // ── Note CRUD

useEffect(() => {
    fetchNotes();
}, []);

const fetchNotes = async () => {

    try {

        const res = await axios.get('http://localhost:3000/notes');

        const formattedNotes = res.data.map(note => ({

            ...note,

            // convert MongoDB _id → id
            id: note._id,

            // convert string date → JS Date object
            created: new Date(note.created)

        }));

        setNotes(formattedNotes);

    } catch (error) {

        console.log(error);

    }

};

const saveNote = async (data, existing) => {

    try {

        if(existing){

            const res = await axios.put(
                `http://localhost:3000/notes/${existing.id}`,
                data
            );

            const updatedNote = {
                ...res.data,
                id: res.data._id,
                created: new Date(res.data.created)
            };

            setNotes(ns =>
                ns.map(n =>
                    n.id === existing.id ? updatedNote : n
                )
            );

        } else {

            const newNote = {
                ...data,
                pinned:false,
                archived:false,
                trashed:false,
                created:new Date()
            };

            const res = await axios.post(
                'http://localhost:3000/notes',
                newNote
            );

            const savedNote = {
                ...res.data,
                id: res.data._id,
                created: new Date(res.data.created)
            };

            setNotes(ns => [...ns, savedNote]);

        }

    } catch (error) {

        console.log(error);

    }

};

  const pinNote    = id => setNotes(ns=>ns.map(n=>n.id===id?{...n,pinned:!n.pinned}:n))
  const archiveNote= id => setNotes(ns=>ns.map(n=>n.id===id?{...n,archived:true,pinned:false}:n))
  const trashNote  = id => setNotes(ns=>ns.map(n=>n.id===id?{...n,trashed:true,archived:false,pinned:false}:n))
  const restoreNote= id => setNotes(ns=>ns.map(n=>n.id===id?{...n,trashed:false,archived:false}:n))
  const deleteNote = id => setNotes(ns=>ns.filter(n=>n.id!==id))

  // ── Folder CRUD
  const saveFolder = (data, existing) => {
    if(existing){ setFolders(fs=>fs.map(f=>f.id===existing.id?{...f,...data}:f)) }
    else { setFolders(fs=>[...fs,{id:uid(),...data,noteCount:0,created:fmt(new Date())}]) }
  }
  const deleteFolder = id => {
    setFolders(fs=>fs.filter(f=>f.id!==id))
    setNotes(ns=>ns.map(n=>n.folderId===id?{...n,folderId:null}:n))
    if(activeFolder?.id===id) setActiveFolder(null)
  }

  // ── Filtering
  const filterNotes = (ns) => {
    let res = ns
    if(search) res = res.filter(n=>n.title.toLowerCase().includes(search.toLowerCase())||n.body.toLowerCase().includes(search.toLowerCase()))
    if(colorFilter) res = res.filter(n=>n.color===colorFilter)
    if(activeFolder) res = res.filter(n=>n.folderId===activeFolder.id)
    return res
  }

  const activeNotes   = filterNotes(notes.filter(n=>!n.archived&&!n.trashed))
  const archivedNotes = filterNotes(notes.filter(n=>n.archived&&!n.trashed))
  const trashedNotes  = filterNotes(notes.filter(n=>n.trashed))

  const pinnedNotes = activeNotes.filter(n=>n.pinned)
  const otherNotes  = activeNotes.filter(n=>!n.pinned)

  const sideW = sidebarOpen ? 220 : 0

  return (
    <div style={{minHeight:'100vh',background:'#f4f4f8',fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>

      {/* SIDEBAR */}
      <Sidebar open={sidebarOpen} view={view} setView={v=>{setView(v);setActiveFolder(null)}}
        onAddNote={()=>setNoteModal('new')}
        onClose={()=>setSidebarOpen(false)}/>

      {/* NAVBAR */}
      <header style={{position:'sticky',top:0,zIndex:100,height:64,background:'#fff',borderBottom:'1px solid #efefef',display:'flex',alignItems:'center',paddingLeft:sideW+16,paddingRight:24,gap:16,transition:'padding-left 0.3s'}}>
        <button onClick={()=>setSidebarOpen(o=>!o)} style={{background:'none',border:'none',cursor:'pointer',fontSize:22,color:'#374151',padding:4,borderRadius:8,lineHeight:1}}>☰</button>
        <h1 style={{fontWeight:900,fontSize:18,letterSpacing:1,color:'#1a1a2e',flex:1,margin:0}}>
          {activeFolder ? `📁 ${activeFolder.name}` : view==='home'?'MY NOTES':view==='calendar'?'CALENDAR':view==='archive'?'ARCHIVE':'TRASH'}
        </h1>
        {activeFolder && <button onClick={()=>setActiveFolder(null)} style={{fontSize:13,color:'#4f46e5',background:'#ede9fe',border:'none',borderRadius:8,padding:'6px 12px',cursor:'pointer',fontWeight:600}}>← Back</button>}
        <div style={{display:'flex',alignItems:'center',gap:8,background:'#f4f4f8',borderRadius:24,padding:'8px 16px',flex:'0 0 240px'}}>
          <span style={{color:'#94a3b8',fontSize:15}}>🔍</span>
          <input value={search} onChange={e=>setSearch(e.target.value)} type="text" placeholder="Search notes…"
            style={{border:'none',background:'transparent',outline:'none',fontSize:13,color:'#374151',width:'100%'}}/>
          {search&&<button onClick={()=>setSearch('')} style={{background:'none',border:'none',cursor:'pointer',color:'#94a3b8',fontSize:14}}>✕</button>}
        </div>
        <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#f59e0b,#ef4444)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontSize:12,fontWeight:700,cursor:'pointer'}}>SM</div>
      </header>

      {/* MAIN */}
      <main style={{paddingLeft:sideW+0,transition:'padding-left 0.3s'}}>
        <div style={{maxWidth:1100,padding:'28px 28px',margin:'0 auto'}}>

          {/* MODALS */}
          {noteModal && (
            <NoteModal
              note={noteModal==='new'?null:noteModal}
              folders={folders}
              onSave={data=>saveNote(data, noteModal==='new'?null:noteModal)}
              onClose={()=>setNoteModal(null)}/>
          )}
          {folderModal && (
            <FolderModal
              folder={folderModal==='new'?null:folderModal}
              onSave={data=>saveFolder(data, folderModal==='new'?null:folderModal)}
              onClose={()=>setFolderModal(null)}/>
          )}

          {/* ── HOME VIEW ── */}
          {view==='home' && !activeFolder && (
            <>
              {/* FOLDERS */}
              <div style={{marginBottom:36}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
                  <h2 style={{fontWeight:800,fontSize:18,color:'#1a1a2e',margin:0}}>Recent Folders</h2>
                  <button onClick={()=>setFolderModal('new')} style={{fontSize:13,color:'#4f46e5',background:'#ede9fe',border:'none',borderRadius:8,padding:'6px 14px',cursor:'pointer',fontWeight:600}}>+ New Folder</button>
                </div>
                <Tabs tabs={['Todays','This Week','This Month']} active={folderTab} onChange={setFolderTab}/>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:14}}>
                  {folders.map(f=>(
                    <FolderCard key={f.id} folder={f}
                      onClick={setActiveFolder}
                      onEdit={f=>setFolderModal(f)}
                      onDelete={deleteFolder}/>
                  ))}
                  <div onClick={()=>setFolderModal('new')} style={{border:'2px dashed #d1d5db',borderRadius:16,minHeight:110,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,cursor:'pointer',transition:'all 0.15s'}}
                    onMouseEnter={e=>e.currentTarget.style.background='#f0f0ff'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <span style={{fontSize:22,color:'#94a3b8'}}>📁</span>
                    <span style={{fontSize:13,color:'#94a3b8',fontWeight:500}}>New Folder</span>
                  </div>
                </div>
              </div>

              {/* NOTES */}
              <div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                  <h2 style={{fontWeight:800,fontSize:18,color:'#1a1a2e',margin:0}}>My Notes</h2>
                  <div style={{display:'flex',alignItems:'center',gap:8}}>
                    <button onClick={()=>setSidebarOpen(false)||setNoteModal('new')} style={{fontSize:13,color:'#4f46e5',background:'#ede9fe',border:'none',borderRadius:8,padding:'6px 14px',cursor:'pointer',fontWeight:600}}>+ New Note</button>
                  </div>
                </div>
                <Tabs tabs={['Todays','This Week','This Month']} active={noteTab} onChange={setNoteTab}/>

                {/* Color filter */}
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:16}}>
                  <span style={{fontSize:12,color:'#94a3b8',fontWeight:500,marginRight:2}}>Color:</span>
                  <button onClick={()=>setColorFilter(null)} style={{width:20,height:20,borderRadius:'50%',background:'#e2e8f0',border:colorFilter===null?'2.5px solid #374151':'1.5px solid #d1d5db',cursor:'pointer'}}/>
                  {COLORS.map(c=>(
                    <button key={c.id} onClick={()=>setColorFilter(colorFilter===c.id?null:c.id)}
                      style={{width:20,height:20,borderRadius:'50%',background:c.bg,border:colorFilter===c.id?`2.5px solid ${c.text}`:`1.5px solid ${c.border}`,cursor:'pointer',transition:'transform 0.15s'}}
                      onMouseEnter={e=>e.currentTarget.style.transform='scale(1.2)'}
                      onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}/>
                  ))}
                </div>

                {pinnedNotes.length>0&&(
                  <>
                    <div style={{fontSize:12,fontWeight:700,color:'#94a3b8',letterSpacing:1,marginBottom:10}}>📌 PINNED</div>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:14,marginBottom:20}}>
                      {pinnedNotes.map(n=>(
                        <NoteCard key={n.id} note={n} onEdit={setNoteModal} onPin={pinNote} onArchive={archiveNote} onTrash={trashNote} onRestore={restoreNote} onDelete={deleteNote}/>
                      ))}
                    </div>
                    <div style={{fontSize:12,fontWeight:700,color:'#94a3b8',letterSpacing:1,marginBottom:10}}>ALL NOTES</div>
                  </>
                )}
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:14}}>
                  {otherNotes.map(n=>(
                    <NoteCard key={n.id} note={n} onEdit={setNoteModal} onPin={pinNote} onArchive={archiveNote} onTrash={trashNote} onRestore={restoreNote} onDelete={deleteNote}/>
                  ))}
                  <div onClick={()=>setNoteModal('new')} style={{border:'2px dashed #d1d5db',borderRadius:16,minHeight:180,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:6,cursor:'pointer',transition:'all 0.15s'}}
                    onMouseEnter={e=>e.currentTarget.style.background='#f0f0ff'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <span style={{fontSize:26,color:'#94a3b8'}}>📝</span>
                    <span style={{fontSize:13,color:'#94a3b8',fontWeight:500}}>New Note</span>
                  </div>
                </div>
                {activeNotes.length===0&&<div style={{textAlign:'center',color:'#94a3b8',padding:'40px 0',fontSize:15}}>No notes found. Create your first note!</div>}
              </div>
            </>
          )}

          {/* ── FOLDER DETAIL ── */}
          {view==='home' && activeFolder && (
            <>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
                <h2 style={{fontWeight:800,fontSize:18,color:'#1a1a2e',margin:0}}>Notes in "{activeFolder.name}"</h2>
                <button onClick={()=>setNoteModal('new')} style={{fontSize:13,color:'#4f46e5',background:'#ede9fe',border:'none',borderRadius:8,padding:'6px 14px',cursor:'pointer',fontWeight:600}}>+ Add Note</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:14}}>
                {activeNotes.length===0&&<div style={{color:'#94a3b8',fontSize:15}}>No notes in this folder yet.</div>}
                {activeNotes.map(n=>(
                  <NoteCard key={n.id} note={n} onEdit={setNoteModal} onPin={pinNote} onArchive={archiveNote} onTrash={trashNote} onRestore={restoreNote} onDelete={deleteNote}/>
                ))}
              </div>
            </>
          )}

          {/* ── CALENDAR VIEW ── */}
          {view==='calendar' && <CalendarView notes={notes}/>}

          {/* ── ARCHIVE VIEW ── */}
          {view==='archive' && (
            <>
              <h2 style={{fontWeight:800,fontSize:18,color:'#1a1a2e',marginBottom:16}}>Archived Notes</h2>
              {archivedNotes.length===0&&<div style={{textAlign:'center',color:'#94a3b8',padding:'40px 0',fontSize:15}}>No archived notes.</div>}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:14}}>
                {archivedNotes.map(n=>(
                  <NoteCard key={n.id} note={n} onEdit={()=>{}} onPin={pinNote} onArchive={archiveNote} onTrash={trashNote} onRestore={restoreNote} onDelete={deleteNote} archived/>
                ))}
              </div>
            </>
          )}

          {/* ── TRASH VIEW ── */}
          {view==='trash' && (
            <>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
                <h2 style={{fontWeight:800,fontSize:18,color:'#1a1a2e',margin:0}}>Trash</h2>
                {trashedNotes.length>0&&(
                  <button onClick={()=>setNotes(ns=>ns.filter(n=>!n.trashed))} style={{fontSize:13,color:'#ef4444',background:'#fee2e2',border:'none',borderRadius:8,padding:'6px 14px',cursor:'pointer',fontWeight:600}}>🗑 Empty Trash</button>
                )}
              </div>
              {trashedNotes.length===0&&<div style={{textAlign:'center',color:'#94a3b8',padding:'40px 0',fontSize:15}}>Trash is empty.</div>}
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:14}}>
                {trashedNotes.map(n=>(
                  <NoteCard key={n.id} note={n} onEdit={()=>{}} onPin={pinNote} onArchive={archiveNote} onTrash={trashNote} onRestore={restoreNote} onDelete={deleteNote} trashed/>
                ))}
              </div>
            </>
          )}

        </div>
      </main>

      {/* Mobile sidebar overlay */}
      <style>{`
        @media(max-width:768px){
          .sb-overlay{display:block!important;}
        }
      `}</style>
    </div>
  )
}