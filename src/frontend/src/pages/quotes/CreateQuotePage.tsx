import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useListCustomers, useListProducts, useCreateQuote } from '../../hooks/useQueries';
import PageHeader from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { formatCurrency, bigintToNumber } from '../../utils/format';
import { toast } from 'sonner';
import type { QuoteLineItem } from '../../backend';

interface LineItemForm {
  productId: string;
  productName: string;
  quantity: string;
  unitPrice: string;
}

export default function CreateQuotePage() {
  const navigate = useNavigate();
  const { data: customers = [] } = useListCustomers();
  const { data: products = [] } = useListProducts();
  const createQuote = useCreateQuote();

  const [customerId, setCustomerId] = useState('');
  const [lineItems, setLineItems] = useState<LineItemForm[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');

  const addLineItem = () => {
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) {
      toast.error('Please select a product');
      return;
    }

    setLineItems([
      ...lineItems,
      {
        productId: product.id,
        productName: product.name,
        quantity: '1',
        unitPrice: product.price.toString(),
      },
    ]);
    setSelectedProductId('');
  };

  const removeLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItemForm, value: string) => {
    const updated = [...lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setLineItems(updated);
  };

  const calculateLineTotal = (item: LineItemForm): number => {
    const qty = parseInt(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return qty * price;
  };

  const subtotal = lineItems.reduce((sum, item) => sum + calculateLineTotal(item), 0);
  const tax = subtotal * 0.22;
  const total = subtotal + tax;

  const handleSubmit = async () => {
    if (!customerId) {
      toast.error('Please select a customer');
      return;
    }

    if (lineItems.length === 0) {
      toast.error('Please add at least one line item');
      return;
    }

    const quoteLineItems: QuoteLineItem[] = lineItems.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: BigInt(item.quantity),
      unitPrice: parseFloat(item.unitPrice),
      total: calculateLineTotal(item),
    }));

    try {
      const quote = await createQuote.mutateAsync({ customerId, lineItems: quoteLineItems });
      toast.success('Quote created successfully');
      navigate({ to: `/quotes/${quote.id}` });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create quote');
    }
  };

  return (
    <div>
      <PageHeader
        title="Create Quote"
        description="Generate a new quote for a customer"
        actions={
          <Button variant="outline" onClick={() => navigate({ to: '/quotes' })}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        }
      />

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Customer Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="customer">Select Customer *</Label>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger id="customer">
                  <SelectValue placeholder="Choose a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name} ({customer.email || customer.phone || customer.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a product to add" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {formatCurrency(product.price)} (Stock: {bigintToNumber(product.quantity)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={addLineItem} disabled={!selectedProductId}>
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>

            {lineItems.length > 0 && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="w-[120px]">Quantity</TableHead>
                      <TableHead className="w-[140px]">Unit Price</TableHead>
                      <TableHead className="text-right w-[120px]">Total</TableHead>
                      <TableHead className="w-[60px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unitPrice}
                            onChange={(e) => updateLineItem(index, 'unitPrice', e.target.value)}
                            className="h-8"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(calculateLineTotal(item))}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeLineItem(index)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quote Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax (22%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={createQuote.isPending || !customerId || lineItems.length === 0}
              className="w-full mt-6"
            >
              {createQuote.isPending ? 'Creating...' : 'Create Quote'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
