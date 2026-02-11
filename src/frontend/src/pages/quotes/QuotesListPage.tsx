import { useState } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { useListQuotes } from '../../hooks/useQueries';
import PageHeader from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent } from '../../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Plus, Search, FileText, Eye } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/format';

export default function QuotesListPage() {
  const { data: quotes = [], isLoading } = useListQuotes();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredQuotes = quotes.filter((quote) => {
    const query = searchQuery.toLowerCase();
    return (
      quote.id.toString().includes(query) ||
      quote.customerName.toLowerCase().includes(query) ||
      quote.customerId.toLowerCase().includes(query)
    );
  });

  const sortedQuotes = [...filteredQuotes].sort((a, b) => Number(b.id - a.id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Quotes"
        description="Manage customer quotes and proposals"
        actions={
          <Button onClick={() => navigate({ to: '/quotes/create' })}>
            <Plus className="w-4 h-4 mr-2" />
            Create Quote
          </Button>
        }
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by quote ID or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {sortedQuotes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No quotes found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search' : 'Get started by creating your first quote'}
              </p>
              {!searchQuery && (
                <Button onClick={() => navigate({ to: '/quotes/create' })}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Quote
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Quote #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Tax</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedQuotes.map((quote) => (
                    <TableRow key={quote.id.toString()}>
                      <TableCell className="font-mono">{quote.id.toString()}</TableCell>
                      <TableCell className="font-medium">{quote.customerName}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(quote.created)}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(quote.subtotal)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(quote.tax)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(quote.total)}
                      </TableCell>
                      <TableCell>
                        <Link to="/quotes/$id" params={{ id: quote.id.toString() }}>
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
