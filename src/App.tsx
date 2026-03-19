import { useEffect, useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { syncEngine } from './services/syncEngine';
import { seedDatabase } from './services/seed';
import { MainLayout } from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import { Rebanho } from './pages/pecuaria/Rebanho';
import { Lote } from './pages/pecuaria/Lote';
import { Pasto } from './pages/pecuaria/Pasto';
import { Pesagem } from './pages/pecuaria/Pesagem';
import { Confinamento } from './pages/pecuaria/Confinamento';
import { Estoque } from './pages/estoque/Estoque';
import { Insumo } from './pages/estoque/Insumo';
import { Movimentacao } from './pages/estoque/Movimentacao';
import { Inventario } from './pages/estoque/Inventario';
import { Reproducao } from './pages/pecuaria/Reproducao';
import { Nutricao } from './pages/pecuaria/Nutricao';
import { Sanidade } from './pages/pecuaria/Sanidade';
import { Abate } from './pages/pecuaria/Abate';
import { PlanoContas } from './pages/contabil/PlanoContas';
import { LivroCaixa } from './pages/contabil/LivroCaixa';
import { Imposto } from './pages/contabil/Imposto';
import { PlanejamentoFiscal } from './pages/contabil/PlanejamentoFiscal';
import { PerfilUsuario } from './pages/admin/PerfilUsuario';
import { Empresa } from './pages/admin/Empresa';
import { Usuario } from './pages/admin/Usuario';
import { Configuracoes } from './pages/admin/Configuracoes';
import { Definicao } from './pages/admin/Definicao';
import { SaaSAdmin } from './pages/saas/SaaSAdmin';
import { TeamManagement } from './pages/saas/TeamManagement';
import { Frota } from './pages/frota/Frota';
import { Manutencao } from './pages/frota/Manutencao';
import { Abastecimento } from './pages/frota/Abastecimento';
import { FluxoCaixa } from './pages/financeiro/FluxoCaixa';
import { Bancos } from './pages/financeiro/Bancos';
import { Conciliacao } from './pages/financeiro/Conciliacao';
import { Vendas } from './pages/vendas/Vendas';
import { PedidosVenda } from './pages/vendas/pedidos/PedidosVenda';
import { Contratos } from './pages/vendas/contratos/Contratos';
import { Cliente } from './pages/vendas/clientes/Cliente';
import { Oportunidades } from './pages/vendas/oportunidades/Oportunidades';
import { Compra } from './pages/compra/Compra';
import { Fornecedor } from './pages/compra/Fornecedor';
import { SolicitacaoCompraPage } from './pages/compra/SolicitacaoCompra';
import { MapaCotacaoPage } from './pages/compra/MapaCotacao';
import { PedidoCompraPage } from './pages/compra/PedidoCompra';
import { RelatoriosRebanho } from './pages/pecuaria/RelatoriosRebanho';
import { NotasEntradaPage } from './pages/compra/NotasEntrada';
import { ContasPagar } from './pages/financeiro/ContasPagar';
import { ContasReceber } from './pages/financeiro/ContasReceber';
import { NotasSaida } from './pages/vendas/notas/NotasSaida';
import { AlertasCareencia } from './pages/pecuaria/AlertasCareencia';
import { AnaliseCustoNutricao } from './pages/pecuaria/AnaliseCustoNutricao';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CompanyProvider } from './contexts/CompanyContext';
import { LoginPage } from './pages/auth/LoginPage';
import { 
  Users, 
  Settings, 
  Beef, 
  Layers, 
  Map, 
  Scale, 
  Home, 
  Baby, 
  Apple, 
  ShieldCheck, 
  Truck, 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  DollarSign, 
  LayoutList, 
  FileText, 
  BookOpen,
  Loader2
} from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#020617', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="spinning" size={48} color="#4f46e5" />
          <p style={{ marginTop: '1rem', opacity: 0.5 }}>Carregando ambiente seguro...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return <>{children}</>;
};

// React Query Setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

function App() {
  useEffect(() => {
    // Move initialization to next tick to avoid blocking Auth init
    setTimeout(() => {
      // Seed initial data if empty
      seedDatabase();
      
      // Initialize Sync Engine
      syncEngine.init();
      
      // Immediate try to process queue on start
      syncEngine.processQueue();
    }, 100);
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      <AuthProvider>
        <CompanyProvider>
          <BrowserRouter>
            <Routes>
              {/* ... routes ... */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }>
              <Route index element={<Dashboard />} />
              
               {/* Administração */}
               <Route path="admin/users" element={<Usuario />} />
               <Route path="admin/profiles" element={<PerfilUsuario />} />
               <Route path="admin/companies" element={<Empresa />} />
               <Route path="admin/definicao" element={<Definicao />} />
               <Route path="admin/settings" element={<Configuracoes />} />
               <Route path="admin/saas" element={<SaaSAdmin />} />
              <Route path="/equipe" element={<TeamManagement />} />
              
              {/* Pecuária */}
              <Route path="pecuaria/rebanho" element={<Rebanho />} />
              <Route path="pecuaria/lotes" element={<Lote />} />
              <Route path="pecuaria/pastos" element={<Pasto />} />
              <Route path="pecuaria/pesagens" element={<Pesagem />} />
              <Route path="pecuaria/pesagem" element={<Pesagem />} />
              <Route path="pecuaria/confinamento" element={<Confinamento />} />
              <Route path="pecuaria/reproducao" element={<Reproducao />} />
              <Route path="pecuaria/nutricao" element={<Nutricao />} />
              <Route path="pecuaria/sanidade" element={<Sanidade />} />
              <Route path="pecuaria/abate" element={<Abate />} />
              <Route path="pecuaria/alertas" element={<AlertasCareencia onBack={() => window.history.back()} />} />
              <Route path="pecuaria/custo-nutricao" element={<AnaliseCustoNutricao onBack={() => window.history.back()} />} />
              <Route path="pecuaria/relatorios" element={<RelatoriosRebanho onBack={() => window.history.back()} />} />
              
              {/* Outros Módulos */}
              <Route path="maquinas" element={<Frota />} />
              <Route path="maquinas/manutencao" element={<Manutencao />} />
              <Route path="maquinas/abastecimento" element={<Abastecimento />} />
              <Route path="compras" element={<Compra />}>
                <Route path="fornecedores" element={<Fornecedor />} />
                <Route path="solicitacoes" element={<SolicitacaoCompraPage />} />
                <Route path="cotacoes" element={<MapaCotacaoPage />} />
                <Route path="pedidos" element={<PedidoCompraPage />} />
                <Route path="notas-entrada" element={<NotasEntradaPage />} />
              </Route>
              <Route path="vendas" element={<Vendas />}>
                <Route path="clientes" element={<Cliente />} />
                <Route path="pedidos" element={<PedidosVenda />} />
                <Route path="notas-fiscais" element={<NotasSaida />} />
                <Route path="contratos" element={<Contratos />} />
                <Route path="oportunidades" element={<Oportunidades />} />
              </Route>
              
              <Route path="estoque" element={<Estoque />}>
                <Route path="insumos" element={<Insumo />} />
                <Route path="movimentacao" element={<Movimentacao />} />
                <Route path="inventario" element={<Inventario />} />
              </Route>
              
              {/* Financeiro e Banco */}
              <Route path="financeiro/contas-pagar" element={<ContasPagar />} />
              <Route path="financeiro/contas-receber" element={<ContasReceber />} />
              <Route path="financeiro/bancos" element={<Bancos />} />
              <Route path="financeiro/conciliacao" element={<Conciliacao />} />
              <Route path="financeiro/fluxo" element={<FluxoCaixa />} />
              
              {/* Contábil & Fiscal */}
              <Route path="contabil/plano" element={<PlanoContas />} />
              <Route path="contabil/livro-caixa" element={<LivroCaixa />} />
              <Route path="contabil/impostos" element={<Imposto />} />
              <Route path="contabil/planejamento" element={<PlanejamentoFiscal />} />
              
              {/* Fallback */}
              <Route path="*" element={<PlaceholderPage title="Recurso em Desenvolvimento" icon={BookOpen} />} />
            </Route>
          </Routes>
          </BrowserRouter>
        </CompanyProvider>
      </AuthProvider>
    </PersistQueryClientProvider>
  );
}

export default App;
