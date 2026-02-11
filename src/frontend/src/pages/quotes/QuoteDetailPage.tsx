import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetQuote } from '../../hooks/useQueries';
import PageHeader from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { ArrowLeft } from 'lucide-react';
import { formatCurrency, formatDateTime, bigintToNumber } from '../../utils/format';

export default function QuoteDetailPage() {
  const { id } = useParams({ from: '/authenticated/quotes/$id' });
  const navigate = useNavigate();
  const quoteId = id ? BigInt(id) : undefined;
  const { data: quote, isLoading } = useGetQuote(quoteId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold mb-2">Quote not found</h3>
        <Button onClick={() => navigate({ to: '/quotes' })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Quotes
        </Button>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Quote #${quote.id.toString()}`}
        description={formatDateTime(quote.created)}
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
          <CardContent className="space-y-2">
            <div>
              <Label className="text-muted-foreground">Customer Name</Label>
              <p className="text-lg font-medium">{quote.customerName}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Customer ID</Label>
              <p className="text-sm font-mono">{quote.customerId}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.lineItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell className="text-right">{bigintToNumber(item.quantity)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.total)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quote Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium">{formatCurrency(quote.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (22%)</span>
                <span className="font-medium">{formatCurrency(quote.tax)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-3 border-t">
                <span>Total</span>
                <span>{formatCurrency(quote.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
