import React from 'react';
import { Skeleton, Table, TableBody, TableCell, TableHead, TableRow, Box } from '@mui/material';

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 5, cols = 5 }) => {
  return (
    <Box sx={{ overflowX: 'auto' }}>
      <Table>
        <TableHead>
          <TableRow>
            {Array.from(new Array(cols)).map((_, index) => (
              <TableCell key={index}>
                <Skeleton variant="text" sx={{ fontSize: '1rem' }} />
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from(new Array(rows)).map((_, rowIndex) => (
            <TableRow key={rowIndex}>
              {Array.from(new Array(cols)).map((_, colIndex) => (
                <TableCell key={colIndex}>
                  <Skeleton variant="text" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};
