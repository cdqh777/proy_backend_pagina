import { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Bot, Send, X, ChevronDown } from 'lucide-react';

const SUGERENCIAS = [
  '¿Cómo está el inventario?',
  '¿Qué artículos están agotados?',
  '¿Cuáles son los más vendidos?',
  '¿Hay artículos con stock bajo?',
  '¿Qué debo comprar?',
  '¿Hay sugerencias de clientes?',
];

export default function AsistenteIA() {
  const [abierto, setAbierto]         = useState(false);
  const [minimizado, setMinimizado]   = useState(false);
  const [mensajes, setMensajes]       = useState([
    { origen:'agente', texto:'👋 Hola, soy tu asistente de inventario. ¿En qué puedo ayudarte hoy?', tipo:'info' }
  ]);
  const [entrada, setEntrada]         = useState('');
  const [cargando, setCargando]       = useState(false);
  const finRef = useRef(null);

  useEffect(() => {
    finRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [mensajes]);

  const enviar = async (pregunta) => {
    const textoPregunta = (pregunta || entrada).trim();
    if (!textoPregunta) return;
    setMensajes((anterior) => [...anterior, { origen:'usuario', texto:textoPregunta }]);
    setEntrada('');
    setCargando(true);
    try {
      const respuesta = await api.post('/agente/consultar', { pregunta: textoPregunta });
      setMensajes((anterior) => [...anterior, { origen:'agente', texto: respuesta.data.respuesta, tipo: respuesta.data.tipo }]);
    } catch {
      setMensajes((anterior) => [...anterior, { origen:'agente', texto:'⚠️ No pude procesar tu consulta. Intenta de nuevo.', tipo:'alerta' }]);
    } finally {
      setCargando(false);
    }
  };

  const coloresTipo = { exito:'#e8f5e9', advertencia:'#fff8e1', alerta:'#fce4ec', info:'#e3f2fd' };
  const coloresTexto = { exito:'#2e7d32', advertencia:'#e65100', alerta:'#c62828', info:'#1565c0' };

  if (!abierto) {
    return (
      <button onClick={() => setAbierto(true)} style={estilos.botonFlotante} title="Asistente IA">
        <Bot size={22} color="#fff" />
        <span style={estilos.badgeBot}>IA</span>
      </button>
    );
  }

  return (
    <div style={{ ...estilos.ventana, height: minimizado ? 52 : 440 }}>
      <div style={estilos.cabecera}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Bot size={18} color="#fff" />
          <span style={{ fontWeight:600, fontSize:14 }}>Asistente de Inventario</span>
          <span style={estilos.badgeCabecera}>IA</span>
        </div>
        <div style={{ display:'flex', gap:6 }}>
          <button style={estilos.btnCab} onClick={() => setMinimizado((m) => !m)} title={minimizado ? 'Expandir' : 'Minimizar'}>
            <ChevronDown size={16} style={{ transform: minimizado ? 'rotate(180deg)' : 'none', transition:'0.2s' }} />
          </button>
          <button style={estilos.btnCab} onClick={() => setAbierto(false)} title="Cerrar">
            <X size={16} />
          </button>
        </div>
      </div>

      {!minimizado && (
        <>
          <div style={estilos.cuerpo}>
            {mensajes.map((msg, i) => (
              <div key={i} style={{ ...estilos.mensaje, justifyContent: msg.origen === 'usuario' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  ...estilos.burbuja,
                  background: msg.origen === 'usuario' ? 'var(--espresso)' : (coloresTipo[msg.tipo] || '#f5f5f5'),
                  color:       msg.origen === 'usuario' ? '#fff' : (coloresTexto[msg.tipo] || '#333'),
                  borderRadius: msg.origen === 'usuario' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  maxWidth:'82%',
                }}>
                  {msg.texto.split('\n').map((linea, j) => <div key={j}>{linea || <br />}</div>)}
                </div>
              </div>
            ))}
            {cargando && (
              <div style={{ ...estilos.mensaje, justifyContent:'flex-start' }}>
                <div style={{ ...estilos.burbuja, background:'#f5f5f5', color:'#666' }}>
                  <span style={estilos.puntos}>● ● ●</span>
                </div>
              </div>
            )}
            <div ref={finRef} />
          </div>

          {mensajes.length <= 1 && (
            <div style={estilos.sugerencias}>
              {SUGERENCIAS.map((s, i) => (
                <button key={i} style={estilos.chipSugerencia} onClick={() => enviar(s)}>{s}</button>
              ))}
            </div>
          )}

          <div style={estilos.entrada}>
            <input
              style={estilos.inputMensaje}
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !cargando && enviar()}
              placeholder="Escribe tu consulta..."
              disabled={cargando}
            />
            <button style={estilos.botonEnviar} onClick={() => enviar()} disabled={cargando || !entrada.trim()}>
              <Send size={16} />
            </button>
          </div>
        </>
      )}

      <style>{`
        @keyframes parpadeo { 0%,100%{opacity:0.3} 50%{opacity:1} }
        .puntos span { animation: parpadeo 1.2s infinite }
      `}</style>
    </div>
  );
}

const estilos = {
  botonFlotante: { position:'fixed', bottom:28, right:28, width:52, height:52, borderRadius:'50%', background:'var(--espresso)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 4px 16px rgba(74,65,60,0.35)', zIndex:900 },
  badgeBot:      { position:'absolute', top:-4, right:-4, background:'var(--brown)', color:'#fff', fontSize:9, fontWeight:700, borderRadius:8, padding:'1px 5px' },
  ventana:       { position:'fixed', bottom:28, right:28, width:340, background:'#fff', borderRadius:'var(--radius-lg)', boxShadow:'var(--shadow-lg)', display:'flex', flexDirection:'column', zIndex:900, overflow:'hidden', transition:'height 0.3s ease' },
  cabecera:      { background:'var(--espresso)', padding:'12px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 },
  badgeCabecera: { background:'var(--brown)', color:'#fff', fontSize:10, fontWeight:700, borderRadius:8, padding:'1px 6px' },
  btnCab:        { background:'none', border:'none', color:'rgba(255,255,255,0.75)', cursor:'pointer', padding:4, display:'flex', alignItems:'center' },
  cuerpo:        { flex:1, overflowY:'auto', padding:'12px', display:'flex', flexDirection:'column', gap:8 },
  mensaje:       { display:'flex' },
  burbuja:       { padding:'8px 12px', fontSize:13, lineHeight:1.5 },
  puntos:        { letterSpacing:4, fontSize:18 },
  sugerencias:   { padding:'4px 12px 8px', display:'flex', flexWrap:'wrap', gap:6 },
  chipSugerencia: { background:'var(--cream)', border:'1px solid var(--sand)', borderRadius:20, padding:'4px 10px', fontSize:11, cursor:'pointer', color:'var(--espresso)', fontFamily:'var(--font-body)' },
  entrada:       { display:'flex', gap:8, padding:'10px 12px', borderTop:'1px solid #eee', flexShrink:0 },
  inputMensaje:  { flex:1, border:'1.5px solid var(--sand)', borderRadius:'var(--radius-sm)', padding:'7px 10px', fontSize:13, fontFamily:'var(--font-body)', outline:'none' },
  botonEnviar:   { background:'var(--espresso)', border:'none', borderRadius:'var(--radius-sm)', padding:'7px 12px', color:'#fff', cursor:'pointer', display:'flex', alignItems:'center' },
};
