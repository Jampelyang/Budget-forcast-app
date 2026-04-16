import { format } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AuditLog } from '../types';

interface AuditTrailProps {
  logs: AuditLog[];
}

export function AuditTrail({ logs }: AuditTrailProps) {
  return (
    <Card className="border-[#141414]/10 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-bold">System Audit Trail</CardTitle>
        <CardDescription className="font-serif italic">History of all budget modifications and exports</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border border-[#141414]/10 overflow-hidden">
          <Table>
            <TableHeader className="bg-[#141414]/5">
              <TableRow>
                <TableHead className="font-bold">Timestamp</TableHead>
                <TableHead className="font-bold">Action</TableHead>
                <TableHead className="font-bold">Details</TableHead>
                <TableHead className="font-bold">User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-[#141414]/40 italic">
                    No activity recorded yet
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-[#141414]/5 transition-colors">
                    <TableCell className="text-sm text-[#141414]/60">
                      {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-[#141414]/5 border-[#141414]/10">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.details}</TableCell>
                    <TableCell className="text-sm text-[#141414]/60 font-mono">{log.user}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
