import React, { useEffect } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

const TAX_RATE = 0.07;

function ccyFormat(num) {
  return `${num.toFixed(2)}`;
}

function priceRow(qty, unit) {
  return qty * unit;
}

function createRow(desc, qty, unit) {
  const price = priceRow(qty, unit);
  return { desc, qty, unit, price };
}

function subtotal(items) {
  return items.map(({ price }) => price).reduce((sum, i) => sum + i, 0);
}

const rows = [
  createRow("DELIVERY", 100, 1.15),
  createRow("PIC-KUP", 10, 45.99),
  
];

const invoiceSubtotal = subtotal(rows);
const invoiceTaxes = TAX_RATE * invoiceSubtotal;
const invoiceTotal = invoiceTaxes + invoiceSubtotal;

const Revenue = () => {
  return (
    <TableContainer component={Paper} sx={{ marginTop: 5 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell align="center" colSpan={2} sx={{fontWeight: "bold"}}>
              REVENUE DETAILS
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{fontWeight: "bold"}}>ORDER TYPE</TableCell>
            <TableCell align="center" sx={{fontWeight: "bold"}}>TOTAL ORDER</TableCell>
            <TableCell align="center" sx={{fontWeight: "bold"}}>AMOUNT</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.desc}>
              <TableCell>{row.desc}</TableCell>
              <TableCell align="center">{row.qty}</TableCell>
              <TableCell align="center">{row.unit}</TableCell>
              
            </TableRow>
          ))}
          <TableRow>
            <TableCell rowSpan={3} />
            <TableCell colSpan={1} sx={{fontWeight: "bold"}}>Subtotal</TableCell>
            <TableCell align="center">{ccyFormat(invoiceSubtotal)}</TableCell>
          </TableRow>
          <TableRow>
            <TableCell sx={{fontWeight: "bold"}}>Tax</TableCell>
            <TableCell align="center">{`${(TAX_RATE * 100).toFixed(
              0
            )} %`}</TableCell>
           
          </TableRow>
          <TableRow>
            <TableCell colSpan={1} sx={{fontWeight: "bold"}}>Total</TableCell>
            <TableCell align="center">{ccyFormat(invoiceTotal)}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default Revenue;
