import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Order, OrderItem } from '@/services/api/orderService';
import { format } from 'date-fns';

// Add Vietnamese font support
import { jsPDF as JsPDFWithPlugins } from "jspdf";
type JsPDFWithAutoTable = JsPDFWithPlugins & {
  autoTable: (options: any) => any;
};

// Function to generate invoice PDF
export const generateInvoicePDF = (order: Order, orderItems: OrderItem[], companyInfo: any = null) => {
  // Create a new PDF document
  const doc = new jsPDF('p', 'mm', 'a4') as JsPDFWithAutoTable;
  
  // Default company info if not provided
  const company = companyInfo || {
    name: 'Lavie Water',
    address: 'Địa chỉ: Khánh Hòa, Việt Nam',
    phone: 'Điện thoại: 0123456789',
    email: 'Email: contact@laviewater.com',
    taxId: 'Mã số thuế: 0123456789',
  };

  // Set up document properties
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  
  // Add company logo and info
  doc.setFontSize(20);
  doc.setTextColor(0, 102, 204);
  doc.text(company.name, pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(company.address, pageWidth / 2, 25, { align: 'center' });
  doc.text(company.phone, pageWidth / 2, 30, { align: 'center' });
  doc.text(company.email, pageWidth / 2, 35, { align: 'center' });
  
  // Add invoice title
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('HÓA ĐƠN BÁN HÀNG', pageWidth / 2, 45, { align: 'center' });
  
  // Add invoice details
  doc.setFontSize(10);
  doc.text(`Mã hóa đơn: ${order._id}`, margin, 55);
  doc.text(`Ngày: ${format(new Date(order.orderDate), 'dd/MM/yyyy HH:mm')}`, margin, 60);
  doc.text(`Khách hàng: ${order.customerName}`, margin, 65);
  
  // Add order items table
  const tableColumn = ["STT", "Sản phẩm", "Số lượng", "Đơn giá", "Thành tiền"];
  const tableRows = orderItems.map((item, index) => [
    index + 1,
    item.productName,
    item.quantity,
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice),
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.total)
  ]);
  
  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 70,
    theme: 'grid',
    styles: { fontSize: 10, cellPadding: 3 },
    headStyles: { fillColor: [0, 102, 204], textColor: 255 },
    columnStyles: {
      0: { cellWidth: 10 },
      3: { halign: 'right' },
      4: { halign: 'right' }
    },
  });
  
  // Get the final Y position after the table
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  // Add payment information
  doc.text('Thông tin thanh toán:', margin, finalY);
  doc.text(`Tổng tiền: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}`, pageWidth - margin, finalY, { align: 'right' });
  doc.text(`Đã thanh toán: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.paidAmount)}`, pageWidth - margin, finalY + 5, { align: 'right' });
  doc.text(`Còn nợ: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.debtRemaining)}`, pageWidth - margin, finalY + 10, { align: 'right' });
  
  // Add returnable container information
  doc.text('Thông tin vỏ bình:', margin, finalY + 15);
  doc.text(`Vỏ xuất: ${order.returnableOut}`, margin + 30, finalY + 20);
  doc.text(`Vỏ đã trả: ${order.returnableIn}`, margin + 30, finalY + 25);
  doc.text(`Vỏ còn lại: ${order.returnableOut - order.returnableIn}`, margin + 30, finalY + 30);
  
  // Add signature sections
  doc.text('Người mua hàng', margin + 30, finalY + 45, { align: 'center' });
  doc.text('(Ký, ghi rõ họ tên)', margin + 30, finalY + 50, { align: 'center' });
  
  doc.text('Người bán hàng', pageWidth - margin - 30, finalY + 45, { align: 'center' });
  doc.text('(Ký, ghi rõ họ tên)', pageWidth - margin - 30, finalY + 50, { align: 'center' });
  
  // Add additional info if provided
  if (companyInfo && companyInfo.additionalInfo) {
    doc.setFontSize(10);
    doc.text('Thông tin bổ sung:', margin, finalY + 40);
    
    // Handle multiline additional info
    const additionalInfoLines = companyInfo.additionalInfo.split('\n');
    let yPosition = finalY + 45;
    
    additionalInfoLines.forEach((line: string) => {
      doc.text(line, margin, yPosition);
      yPosition += 5; // Move down 5mm for the next line
    });
  }
  
  // Add footer
  doc.setFontSize(8);
  doc.text('Cảm ơn quý khách đã sử dụng dịch vụ của chúng tôi!', pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
  
  return doc;
};

// Function to save the PDF with a specific filename
export const saveInvoicePDF = (order: Order, orderItems: OrderItem[], companyInfo: any = null) => {
  const doc = generateInvoicePDF(order, orderItems, companyInfo);
  const fileName = `hoa-don-${order._id}-${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
  doc.save(fileName);
  return fileName;
};

// Function to open the PDF in a new window
export const printInvoicePDF = (order: Order, orderItems: OrderItem[], companyInfo: any = null) => {
  const doc = generateInvoicePDF(order, orderItems, companyInfo);
  doc.output('dataurlnewwindow');
};
