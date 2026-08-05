package com.electromart.service;

import com.electromart.entity.Order;
import com.electromart.entity.OrderItem;
import com.electromart.exception.ApiException;
import java.awt.Color;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
public class InvoiceService {

    private static final Font TITLE_FONT = new Font(Font.HELVETICA, 20, Font.BOLD, new Color(26, 26, 46));
    private static final Font HEADER_FONT = new Font(Font.HELVETICA, 11, Font.BOLD, Color.WHITE);
    private static final Font NORMAL_FONT = new Font(Font.HELVETICA, 10, Font.NORMAL);
    private static final Font BOLD_FONT = new Font(Font.HELVETICA, 10, Font.BOLD);
    private static final Color BRAND_COLOR = new Color(26, 26, 46);

    public byte[] generateInvoice(Order order) {
        try {
            Document document = new Document(PageSize.A4, 40, 40, 50, 50);
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            PdfWriter.getInstance(document, out);
            document.open();

            addHeader(document, order);
            addAddressSection(document, order);
            addItemsTable(document, order);
            addTotalsSection(document, order);
            addFooter(document);

            document.close();
            return out.toByteArray();
        } catch (DocumentException e) {
            throw new ApiException("Failed to generate invoice: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private void addHeader(Document document, Order order) throws DocumentException {
        Paragraph title = new Paragraph("ElectroMart", TITLE_FONT);
        title.setAlignment(Element.ALIGN_LEFT);
        document.add(title);

        Paragraph subtitle = new Paragraph("TAX INVOICE", new Font(Font.HELVETICA, 12, Font.BOLD, Color.GRAY));
        document.add(subtitle);
        document.add(Chunk.NEWLINE);

        PdfPTable metaTable = new PdfPTable(2);
        metaTable.setWidthPercentage(100);
        metaTable.addCell(borderlessCell("Invoice / Order No: " + order.getOrderNumber(), BOLD_FONT));
        metaTable.addCell(borderlessCell(
                "Date: " + order.getCreatedAt().format(DateTimeFormatter.ofPattern("dd MMM yyyy")), NORMAL_FONT));
        metaTable.addCell(borderlessCell("Payment Method: " + order.getPaymentMethod(), NORMAL_FONT));
        metaTable.addCell(borderlessCell("Payment Status: " + order.getPaymentStatus(), NORMAL_FONT));
        document.add(metaTable);
        document.add(Chunk.NEWLINE);
    }

    private void addAddressSection(Document document, Order order) throws DocumentException {
        Paragraph shipTo = new Paragraph("Ship To:", BOLD_FONT);
        document.add(shipTo);

        StringBuilder address = new StringBuilder();
        address.append(order.getShippingFullName()).append("\n");
        address.append(order.getShippingAddressLine1());
        if (order.getShippingAddressLine2() != null && !order.getShippingAddressLine2().isBlank()) {
            address.append(", ").append(order.getShippingAddressLine2());
        }
        address.append("\n").append(order.getShippingCity()).append(", ").append(order.getShippingState())
                .append(" - ").append(order.getShippingPincode());
        address.append("\nPhone: ").append(order.getShippingPhone());

        document.add(new Paragraph(address.toString(), NORMAL_FONT));
        document.add(Chunk.NEWLINE);
    }

    private void addItemsTable(Document document, Order order) throws DocumentException {
        PdfPTable table = new PdfPTable(new float[] { 4, 1.2f, 1.5f, 1.5f });
        table.setWidthPercentage(100);

        table.addCell(headerCell("Product"));
        table.addCell(headerCell("Qty"));
        table.addCell(headerCell("Unit Price"));
        table.addCell(headerCell("Subtotal"));

        for (OrderItem item : order.getItems()) {
            table.addCell(dataCell(item.getProductName()));
            table.addCell(dataCell(String.valueOf(item.getQuantity())));
            table.addCell(dataCell("Rs. " + item.getUnitPrice()));
            table.addCell(dataCell("Rs. " + item.getSubtotal()));
        }

        document.add(table);
        document.add(Chunk.NEWLINE);
    }

    private void addTotalsSection(Document document, Order order) throws DocumentException {
        PdfPTable table = new PdfPTable(2);
        table.setWidthPercentage(50);
        table.setHorizontalAlignment(Element.ALIGN_RIGHT);

        table.addCell(borderlessCell("Items Total", NORMAL_FONT));
        table.addCell(borderlessCellRight("Rs. " + order.getItemsTotal(), NORMAL_FONT));

        table.addCell(borderlessCell(
                "Discount" + (order.getCouponCode() != null ? " (" + order.getCouponCode() + ")" : ""), NORMAL_FONT));
        table.addCell(borderlessCellRight("- Rs. " + order.getDiscountAmount(), NORMAL_FONT));

        table.addCell(borderlessCell("Shipping", NORMAL_FONT));
        table.addCell(borderlessCellRight("Rs. " + order.getShippingCharge(), NORMAL_FONT));

        table.addCell(borderlessCell("Tax (GST)", NORMAL_FONT));
        table.addCell(borderlessCellRight("Rs. " + order.getTaxAmount(), NORMAL_FONT));

        table.addCell(borderlessCell("Total Amount", BOLD_FONT));
        table.addCell(borderlessCellRight("Rs. " + order.getTotalAmount(), BOLD_FONT));

        document.add(table);
    }

    private void addFooter(Document document) throws DocumentException {
        document.add(Chunk.NEWLINE);
        Paragraph footer = new Paragraph(
                "Thank you for shopping with ElectroMart. For support, contact support@electromart.com",
                new Font(Font.HELVETICA, 9, Font.ITALIC, Color.GRAY));
        footer.setAlignment(Element.ALIGN_CENTER);
        document.add(footer);
    }

    private PdfPCell headerCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, HEADER_FONT));
        cell.setBackgroundColor(BRAND_COLOR);
        cell.setPadding(6);
        return cell;
    }

    private PdfPCell dataCell(String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text, NORMAL_FONT));
        cell.setPadding(6);
        return cell;
    }

    private PdfPCell borderlessCell(String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBorder(Rectangle.NO_BORDER);
        cell.setPadding(4);
        return cell;
    }

    private PdfPCell borderlessCellRight(String text, Font font) {
        PdfPCell cell = borderlessCell(text, font);
        cell.setHorizontalAlignment(Element.ALIGN_RIGHT);
        return cell;
    }
}
