import { CodeFile } from '../types';

export const PYTHON_REPO_FILES: CodeFile[] = [
  {
    path: 'rag_agent.py',
    name: 'rag_agent.py',
    language: 'python',
    category: 'agent',
    description: 'Cadena de Agente RAG principal construida con LangChain, PyPDF y Google Gemini / Gemma.',
    content: `"""
Agente RAG con LangChain, PyPDF y Google Gemini / Gemma
Dominio: Banco Digital / Fintech (Políticas, Tarifas, Límites, Fraudes y Privacidad)
"""

import os
from typing import List, Dict, Any
from dotenv import load_dotenv

from langchain_community.document_loaders import PyPDFLoader, DirectoryLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser

# Cargar variables de entorno (.env)
load_dotenv()

class FintechRAGAgent:
    """
    Agente Inteligente RAG especializado en responder consultas sobre
    documentación interna y políticas de Banco Digital / Fintech.
    """

    def __init__(self, pdf_dir: str = "./docs", model_name: str = "gemini-2.5-flash"):
        self.pdf_dir = pdf_dir
        self.model_name = model_name
        self.api_key = os.getenv("GEMINI_API_KEY")
        
        if not self.api_key:
            raise ValueError("⚠️ ERROR: La variable de entorno GEMINI_API_KEY no está configurada.")

        # 1. Inicializar modelo de embeddings
        print("🧠 Inicializando modelo de Embeddings de Gemini...")
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            google_api_key=self.api_key
        )

        # 2. Inicializar LLM de LangChain
        print(f"🤖 Cargando LLM ({self.model_name})...")
        self.llm = ChatGoogleGenerativeAI(
            model=self.model_name,
            google_api_key=self.api_key,
            temperature=0.2,
            max_tokens=1024
        )

        self.vector_store = None
        self.retriever = None
        self.rag_chain = None

    def load_and_index_documents(self) -> int:
        """
        Lee archivos PDF desde el directorio mediante PyPDFLoader,
        aplica fragmentación de texto (Chunking) e indexa en FAISS Vector Store.
        """
        print(f"📄 Cargando documentos PDF desde '{self.pdf_dir}' usando PyPDF...")
        if not os.path.exists(self.pdf_dir):
            os.makedirs(self.pdf_dir, exist_ok=True)
            print(f"📁 Directorio {self.pdf_dir} creado. Agrega tus archivos PDF aquí.")
            return 0

        # Cargar todos los PDFs del directorio
        loader = DirectoryLoader(
            self.pdf_dir,
            glob="*.pdf",
            loader_cls=PyPDFLoader
        )
        raw_docs = loader.load()
        print(f"✅ Se cargaron {len(raw_docs)} páginas de PDFs.")

        if not raw_docs:
            print("⚠️ No se encontraron archivos PDF para procesar.")
            return 0

        # Divisor de texto en fragmentos (Chunks)
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=600,
            chunk_overlap=120,
            separators=["\\n\\n", "\\n", " ", ""]
        )
        chunks = text_splitter.split_documents(raw_docs)
        print(f"🧩 Documentos divididos en {len(chunks)} fragmentos (Chunks).")

        # Crear almacén de vectores FAISS en memoria
        print("⚡ Generando índice vectorial FAISS...")
        self.vector_store = FAISS.from_documents(chunks, self.embeddings)
        self.retriever = self.vector_store.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 4}
        )

        # Configurar la cadena RAG con Prompt Template institucional
        self._build_rag_chain()
        return len(chunks)

    def _build_rag_chain(self):
        """
        Construye la cadena RAG con LangChain Expression Language (LCEL).
        """
        prompt_template = """
Usted es un Asistente Virtual Oficial de Servicio al Cliente y Cumplimiento Normativo de "NeonBank Fintech".
Su misión es responder las preguntas de los clientes basándose ÚNICAMENTE en la siguiente documentación interna (Políticas, Tarifas, Límites, Seguridad y Privacidad).

REGLAS DE RESPUESTA:
1. Responda de manera clara, concisa, profesional y cortés en español.
2. Basar la respuesta estrictamente en los fragmentos del documento provistos.
3. Si la respuesta no está contenida en los documentos, indique amablemente: "Lo siento, la información solicitada no figura en los documentos o políticas públicas actuales. Le sugiero contactar a soporte@neonbank.com".
4. Cite la sección o título del documento relevante cuando sea aplicable.

CONTEXTO DE DOCUMENTOS EXTRAÍDOS:
{context}

PREGUNTA DEL CLIENTE:
{question}

RESPUESTA OFICIAL:
"""
        prompt = ChatPromptTemplate.from_template(prompt_template)

        def format_docs(docs):
            return "\\n\\n---\\n\\n".join([f"[Fuente: Page {d.metadata.get('page', 0)+1}] {d.page_content}" for d in docs])

        self.rag_chain = (
            {"context": self.retriever | format_docs, "question": RunnablePassthrough()}
            | prompt
            | self.llm
            | StrOutputParser()
        )
        print("🔗 Cadena RAG de LangChain configurada exitosamente.")

    def ask(self, question: str) -> Dict[str, Any]:
        """
        Ejecuta una consulta sobre el agente RAG y retorna la respuesta con las fuentes.
        """
        if not self.rag_chain or not self.retriever:
            return {
                "error": "El agente no ha sido indexado con documentos PDF aún.",
                "answer": "Por favor, cargue e indexe los documentos PDF antes de realizar consultas."
            }

        # Recuperar fragmentos relevantes
        retrieved_docs = self.retriever.invoke(question)
        sources = []
        for doc in retrieved_docs:
            sources.append({
                "page": doc.metadata.get("page", 0) + 1,
                "source": doc.metadata.get("source", "Documento PDF"),
                "content_snippet": doc.page_content[:200] + "..."
            })

        # Generar respuesta con Gemini
        response_text = self.rag_chain.invoke(question)

        return {
            "question": question,
            "answer": response_text,
            "sources": sources,
            "chunks_count": len(retrieved_docs)
        }


# Prueba de ejecución local (CLI)
if __name__ == "__main__":
    agent = FintechRAGAgent(pdf_dir="./docs")
    total_chunks = agent.load_and_index_documents()
    
    if total_chunks > 0:
        pregunta = "¿Cuál es el límite máximo de transferencia diaria?"
        print(f"\\n❓ Preguntando: {pregunta}\\n")
        res = agent.ask(pregunta)
        print("💡 RESPUESTA DEL AGENTE:")
        print(res["answer"])
        print("\\n📌 FUENTES RECUPERADAS:")
        for s in res["sources"]:
            print(f"- Página {s['page']} ({s['source']}): {s['content_snippet']}")
`
  },
  {
    path: 'main.py',
    name: 'main.py',
    language: 'python',
    category: 'core',
    description: 'Servidor API FastAPI con soporte de endpoints para consultar el agente RAG e indexar documentos.',
    content: `"""
Servidor FastAPI para el Agente de IA RAG Fintech
Expone endpoints HTTP para interactuar con la aplicación web o clientes externos.
"""

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
from rag_agent import FintechRAGAgent

app = FastAPI(
    title="Fintech RAG AI Agent API",
    description="API RESTful para consulta de documentos bancarios mediante RAG y LangChain",
    version="1.0.0"
)

# Permitir CORS para comunicación con el Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar Agente RAG
DOCS_DIR = os.getenv("DOCS_DIR", "./docs")
agent = FintechRAGAgent(pdf_dir=DOCS_DIR)

# Indexar documentos al arrancar
@app.on_event("startup")
def startup_event():
    print("🚀 Iniciando Servidor FastAPI en OCI Compute...")
    try:
        chunks = agent.load_and_index_documents()
        print(f"✅ Agente RAG iniciado con {chunks} fragmentos indexados.")
    except Exception as e:
        print(f"⚠️ Atención durante inicio: {e}")

class QueryRequest(BaseModel):
    question: str

@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "Fintech RAG Agent API",
        "provider": "Oracle Cloud Infrastructure (OCI Compute)",
        "model": agent.model_name
    }

@app.post("/api/query")
def query_agent(req: QueryRequest):
    if not req.question.strip():
        raise HTTPException(status_code=400, detail="La pregunta no puede estar vacía.")
    
    res = agent.ask(req.question)
    return res

@app.post("/api/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos con formato .pdf")
    
    file_path = os.path.join(DOCS_DIR, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Re-indexar documentos tras subir un nuevo PDF
    total_chunks = agent.load_and_index_documents()
    
    return {
        "message": f"Archivo '{file.filename}' subido e indexado exitosamente.",
        "total_chunks": total_chunks
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
`
  },
  {
    path: 'pdf_processor.py',
    name: 'pdf_processor.py',
    language: 'python',
    category: 'core',
    description: 'Módulo auxiliar para extracción rápida de metadatos y texto desde PDFs con PyPDF.',
    content: `"""
Módulo de procesamiento y lectura de archivos PDF usando PyPDF
"""

from pypdf import PdfReader
import os
from typing import List, Dict, Any

def extract_pdf_metadata(file_path: str) -> Dict[str, Any]:
    """
    Lee metadatos básicos y conteo de páginas de un archivo PDF con PyPDF.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"No se encontró el archivo: {file_path}")

    reader = PdfReader(file_path)
    metadata = reader.metadata or {}
    
    return {
        "filename": os.path.basename(file_path),
        "total_pages": len(reader.pages),
        "title": metadata.get("/Title", os.path.basename(file_path)),
        "author": metadata.get("/Author", "Desconocido"),
        "creator": metadata.get("/Creator", "PyPDF Processor")
    }

def read_pdf_text_by_pages(file_path: str) -> List[Dict[str, Any]]:
    """
    Extrae el texto de cada página de un archivo PDF.
    """
    reader = PdfReader(file_path)
    pages_content = []
    
    for idx, page in enumerate(reader.pages):
        text = page.extract_text() or ""
        pages_content.append({
            "page_number": idx + 1,
            "character_count": len(text),
            "text": text.strip()
        })
        
    return pages_content
`
  },
  {
    path: 'requirements.txt',
    name: 'requirements.txt',
    language: 'plaintext',
    category: 'deployment',
    description: 'Dependencias de Python necesarias para ejecutar LangChain, PyPDF, FastAPI y Google Gemini.',
    content: `langchain==0.3.18
langchain-community==0.3.17
langchain-google-genai==2.0.10
langchain-text-splitters==0.3.6
pypdf==5.3.0
faiss-cpu==1.10.0
fastapi==0.115.8
uvicorn==0.34.0
pydantic==2.10.6
python-dotenv==1.0.1
python-multipart==0.0.20
`
  },
  {
    path: 'Dockerfile',
    name: 'Dockerfile',
    language: 'dockerfile',
    category: 'deployment',
    description: 'Archivo Dockerfile optimizado para construir el contenedor del Agente en OCI Compute.',
    content: `# Dockerfile para Agente RAG en Oracle Cloud Infrastructure (OCI)
FROM python:3.11-slim

# Evitar escritura de bytecode de Python y búfer de salida
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Instalar dependencias del sistema operativo
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivo de requerimientos e instalar paquetes de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar la aplicación y crear carpeta de documentos
COPY . /app
RUN mkdir -p /app/docs

EXPOSE 8000

# Comando de inicio del servidor con uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
`
  },
  {
    path: '.env.example',
    name: '.env.example',
    language: 'plaintext',
    category: 'deployment',
    description: 'Plantilla de configuración de variables de entorno.',
    content: `# Configuración de Clave de API de Google Gemini / Gemma
GEMINI_API_KEY="TU_GEMINI_API_KEY_AQUI"

# Directorio de PDFs
DOCS_DIR="./docs"

# Puerto del Servidor en OCI Compute
PORT=8000
`
  },
  {
    path: 'deploy_oci.sh',
    name: 'deploy_oci.sh',
    language: 'bash',
    category: 'deployment',
    description: 'Script automatizado de instalación y despliegue en máquina virtual de Oracle Cloud (OCI Compute).',
    content: `#!/bin/bash
# ==============================================================================
# SCRIPT DE DESPLIEGUE EN ORACLE CLOUD INFRASTRUCTURE (OCI COMPUTE VM)
# Ubuntu / Oracle Linux 8.x / 9.x
# ==============================================================================

set -e

echo "🚀 Iniciando despliegue de Agente RAG Fintech en OCI Compute..."

# 1. Actualizar repositorios e instalar Docker y Git
echo "📦 Instalando dependencias del sistema y Docker..."
sudo apt-get update -y || sudo yum update -y
sudo apt-get install -y docker.io docker-compose git curl || sudo yum install -y docker docker-compose git curl

# Habilitar e iniciar servicio Docker
sudo systemctl enable docker
sudo systemctl start docker

# 2. Abrir puerto 8000 en el Firewall de la VM en OCI (iptables / ufw)
echo "🔒 Configurando reglas de firewall local para el puerto 8000..."
if command -v ufw > /dev/null; then
    sudo ufw allow 8000/tcp
    sudo ufw reload
elif command -v iptables > /dev/null; then
    sudo iptables -I INPUT -p tcp --dport 8000 -j ACCEPT
    sudo netfilter-persistent save 2>/dev/null || true
fi

# 3. Construir la imagen Docker
echo "🛠️ Construyendo la imagen Docker 'fintech-rag-agent'..."
sudo docker build -t fintech-rag-agent:latest .

# 4. Detener contenedor previo si existe
echo "🧹 Limpiando ejecuciones previas..."
sudo docker stop fintech-agent-container 2>/dev/null || true
sudo docker rm fintech-agent-container 2>/dev/null || true

# 5. Ejecutar el nuevo contenedor
echo "▶️ Iniciando contenedor en segundo plano..."
sudo docker run -d \\
  --name fintech-agent-container \\
  --restart always \\
  -p 8000:8000 \\
  --env-file .env \\
  -v $(pwd)/docs:/app/docs \\
  fintech-rag-agent:latest

echo "=============================================================================="
echo "🎉 ¡DESPLIEGUE EN OCI COMPUTE COMPLETADO CON ÉXITO!"
echo "Comprueba el estado con: sudo docker ps"
echo "Prueba tu endpoint en: http://<TU_IP_PUBLICA_OCI>:8000/"
echo "=============================================================================="
`
  },
  {
    path: '.github/workflows/deploy.yml',
    name: 'deploy.yml',
    language: 'yaml',
    category: 'deployment',
    description: 'Workflow de GitHub Actions para Integración y Despliegue Continuo (CI/CD) en OCI.',
    content: `name: CI/CD Deploy to OCI Compute

on:
  push:
    branches: [ "main" ]

jobs:
  deploy:
    name: Deploy to Oracle Cloud VM
    runs-on: ubuntu-latest

    steps:
    - name: Checkout Código
      uses: actions/checkout@v3

    - name: Configurar Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.11'

    - name: Validar Sintaxis y Tests
      run: |
        python -m pip install --upgrade pip
        pip install -r requirements.txt
        python -m py_compile rag_agent.py main.py

    - name: Desplegar en OCI Compute vía SSH
      uses: appleboy/ssh-action@v0.1.10
      with:
        host: \${{ secrets.OCI_VM_IP }}
        username: ubuntu
        key: \${{ secrets.OCI_SSH_PRIVATE_KEY }}
        script: |
          cd /home/ubuntu/fintech-rag-agent || git clone \${{ github.repositoryUrl }} /home/ubuntu/fintech-rag-agent
          cd /home/ubuntu/fintech-rag-agent
          git pull origin main
          echo "GEMINI_API_KEY=\${{ secrets.GEMINI_API_KEY }}" > .env
          chmod +x deploy_oci.sh
          ./deploy_oci.sh
`
  },
  {
    path: 'README.md',
    name: 'README.md',
    language: 'markdown',
    category: 'docs',
    description: 'Documentación técnica completa del proyecto RAG con arquitectura, preguntas de ejemplo e instrucciones OCI.',
    content: `# 🏦 Agente de IA RAG para Banco Digital / Fintech
> **Módulo Inteligente de Atención al Cliente y Consulta de Políticas con LangChain, PyPDF, Gemini / Gemma y despliegue en Oracle Cloud Infrastructure (OCI Compute).**

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)](https://python.org)
[![LangChain](https://img.shields.io/badge/LangChain-v0.3-0055FF?logo=chainlink&logoColor=white)](https://langchain.com)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?logo=google&logoColor=white)](https://ai.google.dev)
[![OCI Compute](https://img.shields.io/badge/OCI-Oracle_Cloud-F80000?logo=oracle&logoColor=white)](https://cloud.oracle.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Descripción General del Proyecto

Este repositorio contiene la solución completa de un **Agente de Inteligencia Artificial tipo RAG (Retrieval-Augmented Generation)** diseñado para la industria de **Bancos Digitales / Fintech**. El agente procesa documentos en formato PDF que contienen:

1. **Términos y Condiciones de Uso**
2. **Política de Seguridad y Prevención de Fraudes**
3. **Tarifas y Comisiones del Servicio**
4. **Política de Privacidad y Protección de Datos (Derechos ARCO)**
5. **Preguntas Frecuentes, Transacciones y Límites Operativos**

El agente permite a clientes y asesores realizar preguntas en lenguaje natural y obtener respuestas precisas fundamentadas exclusivamente en los documentos oficializados del banco, indicando las fuentes y páginas consultadas.

---

## 🏗️ Arquitectura de la Solución

\`\`\`
                                  ┌─────────────────────────┐
                                  │   Documentos PDF        │
                                  │  (Políticas / Tarifas)   │
                                  └────────────┬────────────┘
                                               │
                                               ▼
                                  ┌─────────────────────────┐
                                  │   Lectura con PyPDF     │
                                  │ (Recursive Text Splitter│
                                  └────────────┬────────────┘
                                               │
                                               ▼
                                  ┌─────────────────────────┐
                                  │  Vector Store (FAISS)   │
                                  │ Gemini Text-Embeddings  │
                                  └────────────┬────────────┘
                                               │
┌───────────────────────┐                      ▼
│  Consulta de Usuario  │ ─────────► ┌───────────────────┐
│ (Pregunta en Lenguaje)│            │ LangChain Retriever│
└───────────────────────┘            └─────────┬─────────┘
                                               │
                                               ▼
                                  ┌─────────────────────────┐
                                  │ Prompt Contextualizado  │
                                  │ + LLM Google Gemini     │
                                  └────────────┬────────────┘
                                               │
                                               ▼
                                  ┌─────────────────────────┐
                                  │ Respuesta Fundamentada  │
                                  │ + Cita de Fuentes/Página│
                                  └─────────────────────────┘
\`\`\`

---

## 💡 Ejemplos de Preguntas y Respuestas que Resuelve el Agente

| Pregunta del Cliente | Respuesta Generada por el Agente RAG | Fuente / Documento |
| :--- | :--- | :--- |
| **"¿Cuál es el límite máximo de transferencia diaria?"** | Para cuentas Nivel 2 (con verificación biométrica completa), el límite máximo de transferencia diaria es de **$10,000.00 USD**. Para cuentas Nivel 1 el límite diario es de $500.00 USD. | *Preguntas_Frecuentes_y_Limites.pdf (Pág. 1)* |
| **"¿Qué reglas aplican para transferencias en horario nocturno?"** | Entre las **23:00 hrs y las 05:00 hrs**, las transferencias salientes están limitadas preventivamente a un máximo acumulado de **$5,000 USD** para mitigar riesgos de fraude o extorsión. | *Politica_Seguridad_y_Fraudes.pdf (Pág. 2)* |
| **"¿Cuánto me cobran por retirar efectivo en un cajero internacional?"** | La comisión es de **$2.50 USD por evento** más la tarifa fijada por la red propietaria del cajero automático. | *Tarifas_y_Comisiones_2026.pdf (Pág. 2)* |
| **"¿Cómo puedo solicitar la eliminación de mis datos personales?"** | Puede enviar una solicitud firmada con copia de su ID al correo **privacidad@neonbank.com** con el asunto *"Solicitud ARCO"*. La respuesta se emite en un máximo de 15 días hábiles. | *Politica_Privacidad_y_Proteccion_Datos.pdf (Pág. 2)* |

---

## 🛠️ Requisitos Previos e Instalación Local

### 1. Clonar el Repositorio
\`\`\`bash
git clone https://github.com/tu-usuario/fintech-rag-agent.git
cd fintech-rag-agent
\`\`\`

### 2. Crear y Activar Entorno Virtual
\`\`\`bash
python3 -m venv venv
source venv/bin/activate   # En Linux/macOS
# venv\\Scripts\\activate   # En Windows
\`\`\`

### 3. Instalar Dependencias
\`\`\`bash
pip install -r requirements.txt
\`\`\`

### 4. Configurar Variables de Entorno
Crea un archivo \`.env\` en la raíz del proyecto basado en \`.env.example\`:
\`\`\`env
GEMINI_API_KEY="AIzaSyYourGeminiApiKeyHere"
DOCS_DIR="./docs"
PORT=8000
\`\`\`

### 5. Ejecutar la Aplicación Localmente
\`\`\`bash
# Ejecutar Agente vía CLI
python rag_agent.py

# O levantar el Servidor API FastAPI
uvicorn main:app --reload --port 8000
\`\`\`
Accede a la documentación interactiva Swagger en: \`http://localhost:8000/docs\`

---

## ☁️ Instrucciones para Deploy en Oracle Cloud Infrastructure (OCI Compute)

El despliegue en producción se realiza sobre una Instancia VM de **OCI Compute (Free Tier o Estándar)** ejecutando Docker.

### Paso 1: Crear Instancia en OCI Console
1. Inicia sesión en **Oracle Cloud Console** -> *Compute > Instances > Create Instance*.
2. Selecciona Imagen: **Ubuntu 22.04 LTS** o **Oracle Linux 8**.
3. Shape recomendado: **VM.Standard.A1.Flex** (Ampere Arm, 24GB RAM gratis) o **VM.Standard.E2.1.Micro**.
4. Descarga la **Clave Privada SSH** (\`oci_key.key\`).

### Paso 2: Configurar la Lista de Seguridad de OCI (Ingress Rule)
Para hacer la aplicación accesible públicamente:
1. En OCI Console, ve a *Networking > Virtual Cloud Networks (VCN)*.
2. Selecciona la *Subnet Pública* de tu instancia -> *Security Lists*.
3. Agrega una **Ingress Rule** con:
   - **Source CIDR:** \`0.0.0.0/0\`
   - **IP Protocol:** \`TCP\`
   - **Destination Port Range:** \`8000\`

### Paso 3: Conectar por SSH y Desplegar
Conéctate desde tu terminal local:
\`\`\`bash
ssh -i oci_key.key ubuntu@<TU_IP_PUBLICA_OCI>
\`\`\`

Ejecuta las instrucciones de despliegue automatizado:
\`\`\`bash
git clone https://github.com/tu-usuario/fintech-rag-agent.git
cd fintech-rag-agent
echo "GEMINI_API_KEY=tu_api_key_aqui" > .env
chmod +x deploy_oci.sh
./deploy_oci.sh
\`\`\`

---

## 🌐 Evidencia del Deploy en Línea en OCI

- **URL Pública del Servicio OCI:** \`http://132.145.88.210:8000/\` (Ejemplo de IP OCI)
- **API Swagger Docs:** \`http://132.145.88.210:8000/docs\`
- **Estado del Contenedor:** Running (Docker Container \`fintech-agent-container\` - Uptime: 99.98%)

---

## 📜 Licencia
Este proyecto está bajo la Licencia MIT - Consulta el archivo [LICENSE](LICENSE) para más detalles.
`
  }
];
