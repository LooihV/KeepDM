import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import { LoginForm } from '@/components/login-form'
import { SignupForm } from '@/components/signup-form'
import { PageLayout } from '@/components/page-layout'
import { ProtectedRoute } from '@/components/protected-route'
import { PublicRoute } from '@/components/public-route'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Dashboard } from '@/views/dashboard'
import { TableManager } from '@/views/table-manager'
import { Table } from '@/views/table'
import { Upload } from '@/views/upload'
import { UploadDetail } from '@/views/upload-detail'
import { UploadPreview } from '@/views/upload-preview'
import { Profile } from '@/views/profile'
import { Templates } from '@/views/templates'
import { TemplateCreate } from '@/views/template-create'
import { TemplateDetail } from '@/views/template-detail'
import { TemplateEdit } from '@/views/template-edit'

function App() {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <div className="min-h-screen flex items-center justify-center relative">
            <div className="absolute top-4 right-4">
              <ModeToggle />
            </div>
            <LoginForm />
          </div>
        </PublicRoute>
      } />
      <Route path="/signup" element={
        <PublicRoute>
          <div className="min-h-screen flex items-center justify-center relative">
            <div className="absolute top-4 right-4">
              <ModeToggle />
            </div>
            <SignupForm />
          </div>
        </PublicRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <PageLayout breadcrumbPage="Dashboard">
            <Dashboard />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/table-manager" element={
        <ProtectedRoute>
          <PageLayout breadcrumbPage="Gestor de Tablas">
            <TableManager />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/table" element={
        <ProtectedRoute>
          <PageLayout breadcrumbPage="Tablas">
            <Table />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/upload" element={
        <ProtectedRoute>
          <PageLayout breadcrumbPage="Cargar Datos">
            <Upload />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/upload/:id" element={
        <ProtectedRoute>
          <PageLayout breadcrumbPage="Detalle del Archivo">
            <UploadDetail />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/upload/:id/preview" element={
        <ProtectedRoute>
          <PageLayout breadcrumbPage="Preview de Datos">
            <UploadPreview />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <PageLayout breadcrumbPage="Perfil">
            <Profile />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/templates" element={
        <ProtectedRoute>
          <PageLayout breadcrumbPage="Templates">
            <Templates />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/templates/create" element={
        <ProtectedRoute>
          <PageLayout breadcrumbPage="Crear Template">
            <TemplateCreate />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/templates/:id" element={
        <ProtectedRoute>
          <PageLayout breadcrumbPage="Detalle del Template">
            <TemplateDetail />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/templates/:id/edit" element={
        <ProtectedRoute>
          <PageLayout breadcrumbPage="Editar Template">
            <TemplateEdit />
          </PageLayout>
        </ProtectedRoute>
      } />
      <Route path="/" element={
        <div className="flex items-center justify-center min-h-screen">
          <div className="absolute top-4 right-4">
            <ModeToggle />
          </div>
          <div className="text-center space-y-6">
            <h1 className="text-4xl font-bold">KeepDM</h1>
            <p className="text-muted-foreground">Elige una opción:</p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/signup">Sign Up</Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      } />
    </Routes>
  )
}

export default App

