import { useState } from 'react';
import { useParams, useNavigate, Link } from '@tanstack/react-router';
import { useGetCustomer, useDeleteCustomer, useListQuotesByCustomer } from '../../hooks/useQueries';
import PageHeader from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../components/ui/alert-dialog';
import { ArrowLeft, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import CustomerForm from './CustomerForm';
import { formatCurrency, formatDate } from '../../utils/format';

export default function CustomerDetailPage() {
  const { id } = useParams({ from: '/authenticated/customers/$id' });
  const navigate = useNavigate();
  const { data: customer, isLoading } = useGetCustomer(id);
  const { data: quotes = [] } = useListQuotesByCustomer(id);
  const deleteCustomer = useDeleteCustomer();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    if (!customer) return;
    try {
      await deleteCustomer.mutateAsync(customer.id);
      toast.success('Customer deleted successfully');
      navigate({ to: '/customers' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete customer');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Customer not found</h3>
        <Button onClick={() => navigate({ to: '/customers' })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={customer.name}
        description={`Customer ID: ${customer.id}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate({ to: '/customers' })}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" onClick={() => setShowEditDialog(true)}>
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="text-lg font-medium">{customer.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Email</Label>
              <p className="text-sm">{customer.email || '—'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Phone</Label>
              <p className="text-sm">{customer.phone || '—'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Address</Label>
              <p className="text-sm">{customer.address || '—'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Quotes</CardTitle>
          </CardHeader>
          <CardContent>
            {quotes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No quotes yet</p>
            ) : (
              <div className="space-y-3">
                {quotes.slice(0, 5).map((quote) => (
                  <Link
                    key={quote.id.toString()}
                    to="/quotes/$id"
                    params={{ id: quote.id.toString() }}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Quote #{quote.id.toString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(quote.created)}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-medium">{formatCurrency(quote.total)}</p>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <CustomerForm
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        customer={customer}
        onSuccess={() => setShowEditDialog(false)}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Customer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{customer.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteCustomer.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
