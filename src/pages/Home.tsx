import { FlowEditor } from '@/components/flow/FlowEditor';
import { LoginForm } from '@/components/forms/LoginForm';
import { DataGrid } from '@/components/grid/DataGrid';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { ColDef } from 'ag-grid-community';
import { useState } from 'react';

interface SampleData {
  id: number;
  name: string;
  email: string;
  status: string;
}

const sampleData: SampleData[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Inactive' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Active' },
];

const columnDefs: ColDef<SampleData>[] = [
  { field: 'id', headerName: 'ID', width: 80 },
  { field: 'name', headerName: 'Name' },
  { field: 'email', headerName: 'Email' },
  { field: 'status', headerName: 'Status' },
];

export function HomePage() {
  const [activeTab, setActiveTab] = useState<'form' | 'grid' | 'flow'>('form');

  const handleLogin = (data: { email: string; password: string }) => {
    console.log('Login data:', data);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-center text-4xl font-bold">React Scaffold Demo</h1>

      <div className="mb-8 flex justify-center gap-4">
        <Button
          variant={activeTab === 'form' ? 'default' : 'outline'}
          onClick={() => setActiveTab('form')}
        >
          Form Example
        </Button>
        <Button
          variant={activeTab === 'grid' ? 'default' : 'outline'}
          onClick={() => setActiveTab('grid')}
        >
          AG Grid Example
        </Button>
        <Button
          variant={activeTab === 'flow' ? 'default' : 'outline'}
          onClick={() => setActiveTab('flow')}
        >
          React Flow Example
        </Button>
      </div>

      {activeTab === 'form' && (
        <div className="flex justify-center">
          <LoginForm onSubmit={handleLogin} />
        </div>
      )}

      {activeTab === 'grid' && (
        <Card>
          <CardHeader>
            <CardTitle>Data Grid</CardTitle>
          </CardHeader>
          <CardContent>
            <DataGrid rowData={sampleData} columnDefs={columnDefs} />
          </CardContent>
        </Card>
      )}

      {activeTab === 'flow' && (
        <Card>
          <CardHeader>
            <CardTitle>Flow Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <FlowEditor />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
