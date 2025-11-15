import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, RefreshCw, Shield, UserCheck } from 'lucide-react';
import { Card, CardContent } from '../../../shared/components/Card/Card';
import Button from '../../../shared/components/Button/Button';
import Badge from '../../../shared/components/Badge/Badge';
import Loading from '../../../shared/components/Loading/Loading';
import ErrorMessage from '../../../shared/components/ErrorMessage/ErrorMessage';
import CampaignModal from '../../../shared/components/Modal/CampaignModal';
import Input from '../../../shared/components/Input/Input';
import Select from '../../../shared/components/Select/Select';
import { userService } from '../../../shared/services/userService';
import { formatDateTime } from '../../../shared/utils';

// Opções de Role
const roleOptions = [
  { value: 'User', label: 'Usuário (User)' },
  { value: 'Admin', label: 'Administrador (Admin)' },
];

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Estado do formulário
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    password: '',
    role: 'User',
    isActive: true,
    phone: '',
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers();
      setUsers(data || []);
    } catch (err) {
      setError(err.message || "Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleOpenModal = (user = null) => {
    if (user) {
      // Editando
      setEditingUser(user);
      setFormData({
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        password: '', // Senha não é preenchida na edição (deve ser endpoint separado)
        role: user.role || 'User',
        isActive: user.isActive ?? true,
        phone: user.phone || '', // (Assumindo que virá da API)
      });
    } else {
      // Criando
      setEditingUser(null);
      setFormData({
        id: null,
        name: '',
        email: '',
        password: '',
        role: 'User',
        isActive: true,
        phone: '',
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      if (editingUser) {
        // Atualizando (DTO AdminUpdateUserRequest)
        const payload = {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
          phone: formData.phone,
        };
        await userService.updateUser(formData.id, payload);
      } else {
        // Criando (DTO CreateUserRequest)
        const payload = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        };
        await userService.createUser(payload);
      }
      setShowModal(false);
      loadUsers(); // Recarrega a lista
    } catch (err) {
      setError(err.message || "Erro ao salvar usuário.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (userId, userName) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${userName}"?`)) {
      setLoading(true);
      try {
        await userService.deleteUser(userId);
        loadUsers(); // Recarrega a lista
      } catch (err) {
        setError(err.message || "Erro ao excluir usuário.");
        setLoading(false); // Permite tentar novamente
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Usuários</h1>
          <p className="text-gray-600 mt-1">Adicione, edite ou remova usuários do sistema.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={loadUsers} disabled={loading}>
            <RefreshCw size={16} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <Plus size={20} className="mr-2" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {error && <ErrorMessage title="Erro" message={error} onRetry={loadUsers} />}

      {loading && users.length === 0 ? (
        <Loading text="Carregando usuários..." />
      ) : (
        <Card>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="th-cell">Nome</th>
                    <th className="th-cell">E-mail</th>
                    <th className="th-cell">Papel (Role)</th>
                    <th className="th-cell">Status</th>
                    <th className="th-cell">Criado Em</th>
                    <th className="th-cell text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="td-cell font-medium">{user.name}</td>
                      <td className="td-cell">{user.email}</td>
                      <td className="td-cell">
                        <Badge variant={user.role === 'Admin' ? 'primary' : 'default'} className="border-2">
                          {user.role === 'Admin' ? <Shield size={12} className="mr-1" /> : <UserCheck size={12} className="mr-1" />}
                          {user.role}
                        </Badge>
                      </td>
                      <td className="td-cell">
                        <Badge variant={user.isActive ? 'success' : 'error'}>
                          {user.isActive ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="td-cell">{formatDateTime(user.createdAt)}</td>
                      <td className="td-cell text-center">
                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(user)} className="mr-2">
                          <Edit size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-error-600 hover:bg-error-50" onClick={() => handleDelete(user.id, user.name)}>
                          <Trash2 size={16} />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && !loading && (
              <p className="text-center py-8 text-gray-500">Nenhum usuário encontrado.</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Criação/Edição */}
      <CampaignModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingUser ? 'Editar Usuário' : 'Novo Usuário'}
      >
        <div className="space-y-4">
          <Input
            label="Nome Completo"
            value={formData.name}
            onChange={(e) => setFormData(f => ({ ...f, name: e.target.value }))}
            required
          />
          <Input
            label="E-mail"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
            required
          />
          {!editingUser && (
            <Input
              label="Senha"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData(f => ({ ...f, password: e.target.value }))}
              placeholder={editingUser ? '(Deixe em branco para não alterar)' : 'Mínimo 6 caracteres'}
              required={!editingUser}
            />
          )}
          <Input
            label="Telefone (Opcional)"
            value={formData.phone}
            onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
          />
          <Select
            label="Papel (Role)"
            value={formData.role}
            onChange={(e) => setFormData(f => ({ ...f, role: e.target.value }))}
            options={roleOptions}
          />
          {editingUser && (
             <div className="flex items-center space-x-2 pt-2">
               <input
                 type="checkbox"
                 id="isActive"
                 checked={formData.isActive}
                 onChange={(e) => setFormData(f => ({ ...f, isActive: e.target.checked }))}
                 className="h-4 w-4"
               />
               <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                 Usuário Ativo
               </label>
             </div>
          )}

          {error && <p className="text-sm text-error-600">{error}</p>}
          
          <div className="flex justify-end space-x-3 pt-4 border-t mt-4">
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSave} isLoading={isSaving}>
              {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
            </Button>
          </div>
        </div>
      </CampaignModal>

      {/* Helper para classes da tabela (evita repetição) */}
      <style>{`
        .th-cell { text-align: left; padding: 12px 16px; font-size: 0.75rem; font-weight: 600; color: #4b5563; text-transform: uppercase; letter-spacing: 0.05em; }
        .td-cell { padding: 12px 16px; font-size: 0.875rem; color: #374151; }
      `}</style>
    </div>
  );
};

export default UsersPage;