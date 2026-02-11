import { useState } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetProduct, useAdjustProductStock, useDeleteProduct } from '../../hooks/useQueries';
import PageHeader from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
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
import { ArrowLeft, Trash2, Plus, Minus } from 'lucide-react';
import { formatCurrency, bigintToNumber } from '../../utils/format';
import { toast } from 'sonner';
import InventoryItemForm from './InventoryItemForm';

export default function InventoryItemDetailPage() {
  const { id } = useParams({ from: '/authenticated/inventory/$id' });
  const navigate = useNavigate();
  const { data: product, isLoading } = useGetProduct(id);
  const adjustStock = useAdjustProductStock();
  const deleteProduct = useDeleteProduct();
  const [adjustAmount, setAdjustAmount] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleAdjustStock = async (operation: 'add' | 'subtract') => {
    if (!product || !adjustAmount) return;

    const amount = parseInt(adjustAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const currentStock = bigintToNumber(product.quantity);
    let newStock: number;

    if (operation === 'add') {
      newStock = currentStock + amount;
    } else {
      newStock = Math.max(0, currentStock - amount);
    }

    try {
      await adjustStock.mutateAsync({ id: product.id, quantity: BigInt(newStock) });
      toast.success(`Stock ${operation === 'add' ? 'increased' : 'decreased'} successfully`);
      setAdjustAmount('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to adjust stock');
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success('Product deleted successfully');
      navigate({ to: '/inventory' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete product');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Product not found</h3>
        <Button onClick={() => navigate({ to: '/inventory' })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Inventory
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={product.name}
        description={`SKU: ${product.id}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate({ to: '/inventory' })}>
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
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-muted-foreground">Name</Label>
              <p className="text-lg font-medium">{product.name}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Description</Label>
              <p className="text-sm">{product.description || '—'}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Unit Price</Label>
              <p className="text-lg font-medium">{formatCurrency(product.price)}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Current Stock</Label>
              <p className="text-2xl font-bold">{bigintToNumber(product.quantity)}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Adjust Stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adjustAmount">Quantity</Label>
              <Input
                id="adjustAmount"
                type="number"
                min="1"
                value={adjustAmount}
                onChange={(e) => setAdjustAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => handleAdjustStock('add')}
                disabled={!adjustAmount || adjustStock.isPending}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Stock
              </Button>
              <Button
                onClick={() => handleAdjustStock('subtract')}
                disabled={!adjustAmount || adjustStock.isPending}
                variant="outline"
                className="flex-1"
              >
                <Minus className="w-4 h-4 mr-2" />
                Remove Stock
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <InventoryItemForm
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        product={product}
        onSuccess={() => setShowEditDialog(false)}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{product.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteProduct.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
