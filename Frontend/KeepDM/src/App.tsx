import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import { LoginForm } from '@/components/login-form'
import { SignupForm } from '@/components/signup-form'
import { PageLayout } from '@/components/page-layout'
import { ModeToggle } from '@/components/mode-toggle'
import { Button } from '@/components/ui/button'
import { Dashboard } from '@/views/dashboard'
import { TableManager } from '@/views/table-manager'
import { Table } from '@/views/table'
import { Upload } from '@/views/upload'

function App() {
  return (
    <Routes>
      <Route path="/login" element={
        <div className="min-h-screen flex items-center justify-center relative">
          <div className="absolute top-4 right-4">
            <ModeToggle />
          </div>
          <LoginForm />
        </div>
      } />
      <Route path="/signup" element={
        <div className="min-h-screen flex items-center justify-center relative">
          <div className="absolute top-4 right-4">
            <ModeToggle />
          </div>
          <SignupForm />
        </div>
      } />
      <Route path="/dashboard" element={
        <PageLayout breadcrumbPage="Dashboard">
          <Dashboard />
        </PageLayout>
      } />
      <Route path="/table-manager" element={
        <PageLayout breadcrumbPage="Gestor de Tablas">
          <TableManager />
        </PageLayout>
      } />
      <Route path="/table" element={
        <PageLayout breadcrumbPage="Tablas">
          <Table />
        </PageLayout>
      } />
      <Route path="/upload" element={
        <PageLayout breadcrumbPage="Cargar Datos">
          <Upload />
        </PageLayout>
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

