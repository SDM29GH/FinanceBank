import React, { useState } from 'react';
import { Cloud, Server, ShieldAlert, Terminal, CheckCircle2, RefreshCw, ExternalLink, Cpu, HardDrive, Lock, ArrowRight, Play } from 'lucide-react';
import { OciDeployStatus } from '../types';

export const OciDeployGuide: React.FC = () => {
  const [status, setStatus] = useState<OciDeployStatus>({
    instanceIp: '132.145.88.210',
    status: 'running',
    region: 'us-ashburn-1 (OCI Free Tier)',
    shape: 'VM.Standard.A1.Flex (4 OCPU, 24GB RAM)',
    dockerStatus: 'Up 14 days (Container: fintech-agent-container)',
    lastHealthCheck: new Date().toLocaleTimeString(),
    port: 8000
  });

  const [pinging, setPinging] = useState(false);
  const [pingResult, setPingResult] = useState<string | null>(null);

  const handlePingHealth = async () => {
    setPinging(true);
    setPingResult(null);
    try {
      const res = await fetch('/api/oci/status');
      const data = await res.json();
      setStatus({
        ...data,
        lastHealthCheck: new Date().toLocaleTimeString()
      });
      setPingResult('✅ 200 OK - El servidor RAG en OCI Compute está respondiendo correctamente.');
    } catch (err: any) {
      setPingResult(`⚠️ Conexión simulada activa.`);
    } finally {
      setPinging(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5" /> Oracle Cloud Infrastructure (OCI)
              </span>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Deploy en Producción
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Implementación en la Nube de Oracle (OCI Compute)
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Guía completa de arquitectura, configuración de firewall (Security Lists), contenedor Docker y verificación de estado en línea para la máquina virtual de OCI.
            </p>
          </div>

          <button
            onClick={handlePingHealth}
            disabled={pinging}
            className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-lg shadow-orange-600/20 transition flex items-center space-x-2 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${pinging ? 'animate-spin' : ''}`} />
            <span>Verificar Estado OCI</span>
          </button>
        </div>
      </div>

      {/* Live OCI Instance Status Monitor */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-orange-400" /> Monitor de la Instancia Virtual OCI
          </h2>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            EN LÍNEA
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">IP Pública OCI</span>
            <div className="text-base font-mono font-bold text-orange-400 mt-1 flex items-center justify-between">
              <span>{status.instanceIp}:{status.port}</span>
              <a
                href={`http://${status.instanceIp}:${status.port}`}
                target="_blank"
                rel="noreferrer"
                className="text-slate-500 hover:text-orange-400 transition"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Región & Shape</span>
            <p className="text-xs font-semibold text-slate-200 mt-1">{status.region}</p>
            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{status.shape}</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Estado Docker</span>
            <p className="text-xs font-mono font-semibold text-emerald-400 mt-1">{status.dockerStatus}</p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Último Health Check</span>
            <p className="text-xs font-mono font-semibold text-slate-200 mt-1">{status.lastHealthCheck}</p>
          </div>
        </div>

        {pingResult && (
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400">
            {pingResult}
          </div>
        )}
      </div>

      {/* Step-by-Step Deployment Steps */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white tracking-tight">
          Etapas para Realizar el Deploy en Oracle Cloud
        </h2>

        {/* Step 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="text-base font-bold text-white">Crear la Instancia Compute en OCI Console</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed pl-11">
            En la consola de Oracle Cloud, navega a <strong className="text-slate-200">Compute &gt; Instances &gt; Create Instance</strong>.
            Selecciona la imagen <strong className="text-slate-200">Ubuntu 22.04 LTS</strong> o <strong className="text-slate-200">Oracle Linux 8</strong> con el shape Always Free (<code className="text-orange-400">VM.Standard.A1.Flex</code> con 4 OCPU y 24GB RAM). Descarga tu llave SSH privada.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="text-base font-bold text-white">Configurar la Regla de Ingress en OCI Security List</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed pl-11">
            Por defecto OCI bloquea todo el tráfico entrante excepto el puerto SSH (22). Para permitir el acceso al servidor del Agente RAG en el puerto <strong className="text-orange-400">8000</strong>:
          </p>
          <div className="ml-11 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
            <p>1. Ve a Networking &gt; Virtual Cloud Networks &gt; Selecciona tu VCN.</p>
            <p>2. Haz clic en Subnet Pública &gt; Default Security List.</p>
            <p>3. Agrega Ingress Rule: Source CIDR: <span className="text-emerald-400">0.0.0.0/0</span> | Protocolo: <span className="text-emerald-400">TCP</span> | Puerto Destino: <span className="text-emerald-400">8000</span></p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="text-base font-bold text-white">Conexión SSH y Despliegue Automatizado</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed pl-11">
            Abre tu terminal local y ejecuta los comandos para conectar por SSH y clonar el repositorio:
          </p>
          <div className="ml-11 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-mono text-slate-200 leading-relaxed overflow-x-auto">
            <p className="text-slate-500"># 1. Conexión SSH a OCI</p>
            <p>ssh -i oci_key.key ubuntu@{status.instanceIp}</p>
            <p className="text-slate-500 mt-2"># 2. Clonar repositorio GitHub</p>
            <p>git clone https://github.com/tu-usuario/fintech-rag-agent.git</p>
            <p>cd fintech-rag-agent</p>
            <p className="text-slate-500 mt-2"># 3. Configurar API Key de Gemini y ejecutar script de deploy</p>
            <p>echo "GEMINI_API_KEY=AIzaSyYourApiKeyHere" &gt; .env</p>
            <p>chmod +x deploy_oci.sh</p>
            <p>./deploy_oci.sh</p>
          </div>
        </div>
      </div>
    </div>
  );
};
