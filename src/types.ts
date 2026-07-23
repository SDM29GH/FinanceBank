export interface DocumentPage {
  pageNumber: number;
  content: string;
}

export interface FintechDocument {
  id: string;
  title: string;
  category: 'terms' | 'security' | 'fees' | 'privacy' | 'limits' | 'custom';
  filename: string;
  pagesCount: number;
  description: string;
  pages: DocumentPage[];
}

export interface DocumentChunk {
  id: string;
  docId: string;
  docTitle: string;
  pageNumber: number;
  section: string;
  content: string;
  tokenCount: number;
}

export interface RAGQueryResult {
  question: string;
  answer: string;
  modelUsed: string;
  latencyMs: number;
  sources: {
    docId: string;
    docTitle: string;
    filename: string;
    pageNumber: number;
    section: string;
    contentSnippet: string;
    similarityScore: number;
  }[];
  timestamp: string;
}

export interface CodeFile {
  path: string;
  name: string;
  language: 'python' | 'markdown' | 'dockerfile' | 'yaml' | 'bash' | 'plaintext';
  category: 'core' | 'agent' | 'deployment' | 'docs';
  content: string;
  description: string;
}

export interface OciDeployStatus {
  instanceIp: string;
  status: 'running' | 'stopped' | 'provisioning' | 'offline';
  region: string;
  shape: string;
  dockerStatus: string;
  lastHealthCheck: string;
  port: number;
}
