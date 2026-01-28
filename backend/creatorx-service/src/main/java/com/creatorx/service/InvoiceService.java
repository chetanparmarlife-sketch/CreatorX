package com.creatorx.service;

import com.creatorx.common.enums.InvoiceStatus;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.InvoiceRepository;
import com.creatorx.repository.entity.Invoice;
import com.creatorx.service.dto.InvoiceDTO;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

/**
 * Service for managing invoices.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("MMM d, yyyy");

    /**
     * Get invoices for a creator (paginated)
     */
    @Transactional(readOnly = true)
    public Page<InvoiceDTO> getInvoices(String creatorId, String status, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));

        Page<Invoice> invoices;
        if (status != null && !status.equalsIgnoreCase("all")) {
            try {
                InvoiceStatus invoiceStatus = InvoiceStatus.valueOf(status.toUpperCase());
                invoices = invoiceRepository.findByCreatorIdAndStatus(creatorId, invoiceStatus, pageable);
            } catch (IllegalArgumentException e) {
                // Invalid status, return all
                invoices = invoiceRepository.findByCreatorId(creatorId, pageable);
            }
        } else {
            invoices = invoiceRepository.findByCreatorId(creatorId, pageable);
        }

        return invoices.map(this::toDTO);
    }

    /**
     * Get a single invoice by ID
     */
    @Transactional(readOnly = true)
    public InvoiceDTO getInvoice(String creatorId, String invoiceId) {
        Invoice invoice = invoiceRepository.findByIdAndCreatorId(invoiceId, creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", invoiceId));
        return toDTO(invoice);
    }

    /**
     * Get invoice counts by status for a creator
     */
    @Transactional(readOnly = true)
    public InvoiceCountsDTO getInvoiceCounts(String creatorId) {
        long paid = invoiceRepository.countByCreatorIdAndStatus(creatorId, InvoiceStatus.PAID);
        long pending = invoiceRepository.countByCreatorIdAndStatus(creatorId, InvoiceStatus.PENDING);
        long overdue = invoiceRepository.countByCreatorIdAndStatus(creatorId, InvoiceStatus.OVERDUE);

        return InvoiceCountsDTO.builder()
                .paid(paid)
                .pending(pending)
                .overdue(overdue)
                .build();
    }

    /**
     * Generate PDF for an invoice using iText
     */
    @Transactional(readOnly = true)
    public byte[] generateInvoicePdf(String creatorId, String invoiceId) {
        Invoice invoice = invoiceRepository.findByIdAndCreatorId(invoiceId, creatorId)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", invoiceId));

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDoc = new PdfDocument(writer);
            Document document = new Document(pdfDoc);

            // Brand color
            DeviceRgb brandColor = new DeviceRgb(79, 70, 229); // Indigo

            // Header
            Paragraph header = new Paragraph("INVOICE")
                    .setFontSize(28)
                    .setBold()
                    .setFontColor(brandColor)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(header);

            // Invoice number and dates
            document.add(new Paragraph("Invoice #: " + invoice.getInvoiceNumber())
                    .setFontSize(12)
                    .setTextAlignment(TextAlignment.RIGHT));
            document.add(new Paragraph("Issue Date: " + invoice.getIssueDate().format(DATE_FORMATTER))
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.RIGHT));
            document.add(new Paragraph("Due Date: " + invoice.getDueDate().format(DATE_FORMATTER))
                    .setFontSize(10)
                    .setTextAlignment(TextAlignment.RIGHT));

            document.add(new Paragraph("\n"));

            // From/To section
            Table headerTable = new Table(UnitValue.createPercentArray(new float[]{1, 1}))
                    .useAllAvailableWidth();

            // From (Brand)
            Cell fromCell = new Cell()
                    .add(new Paragraph("FROM").setBold().setFontColor(ColorConstants.GRAY))
                    .add(new Paragraph(invoice.getBrandName()).setBold().setFontSize(14))
                    .setBorder(null);
            headerTable.addCell(fromCell);

            // To (Creator)
            Cell toCell = new Cell()
                    .add(new Paragraph("TO").setBold().setFontColor(ColorConstants.GRAY))
                    .add(new Paragraph("Creator").setFontSize(14))
                    .setBorder(null)
                    .setTextAlignment(TextAlignment.RIGHT);
            headerTable.addCell(toCell);

            document.add(headerTable);
            document.add(new Paragraph("\n"));

            // Invoice details table
            Table detailsTable = new Table(UnitValue.createPercentArray(new float[]{3, 1}))
                    .useAllAvailableWidth();

            // Header row
            detailsTable.addHeaderCell(new Cell()
                    .add(new Paragraph("Description").setBold())
                    .setBackgroundColor(new DeviceRgb(243, 244, 246)));
            detailsTable.addHeaderCell(new Cell()
                    .add(new Paragraph("Amount").setBold())
                    .setBackgroundColor(new DeviceRgb(243, 244, 246))
                    .setTextAlignment(TextAlignment.RIGHT));

            // Campaign row
            detailsTable.addCell(new Cell()
                    .add(new Paragraph(invoice.getCampaignName()))
                    .add(new Paragraph(invoice.getDescription() != null ? invoice.getDescription() : "Campaign deliverables")
                            .setFontSize(10)
                            .setFontColor(ColorConstants.GRAY)));
            detailsTable.addCell(new Cell()
                    .add(new Paragraph(invoice.getCurrency() + " " + invoice.getAmount()))
                    .setTextAlignment(TextAlignment.RIGHT));

            document.add(detailsTable);
            document.add(new Paragraph("\n"));

            // Total
            Table totalTable = new Table(UnitValue.createPercentArray(new float[]{3, 1}))
                    .useAllAvailableWidth();
            totalTable.addCell(new Cell()
                    .add(new Paragraph("TOTAL").setBold())
                    .setBorder(null)
                    .setTextAlignment(TextAlignment.RIGHT));
            totalTable.addCell(new Cell()
                    .add(new Paragraph(invoice.getCurrency() + " " + invoice.getAmount())
                            .setBold()
                            .setFontSize(16)
                            .setFontColor(brandColor))
                    .setBorder(null)
                    .setTextAlignment(TextAlignment.RIGHT));
            document.add(totalTable);

            // Status
            document.add(new Paragraph("\n"));
            String statusText = "Status: " + invoice.getStatus().name();
            DeviceRgb statusColor = switch (invoice.getStatus()) {
                case PAID -> new DeviceRgb(34, 197, 94); // Green
                case PENDING -> new DeviceRgb(234, 179, 8); // Yellow
                case OVERDUE -> new DeviceRgb(239, 68, 68); // Red
                default -> new DeviceRgb(128, 128, 128); // Gray
            };
            document.add(new Paragraph(statusText)
                    .setFontColor(statusColor)
                    .setBold()
                    .setTextAlignment(TextAlignment.CENTER));

            if (invoice.getPaidDate() != null) {
                document.add(new Paragraph("Paid on: " + invoice.getPaidDate().format(DATE_FORMATTER))
                        .setFontSize(10)
                        .setTextAlignment(TextAlignment.CENTER));
            }

            // Footer
            document.add(new Paragraph("\n\n"));
            document.add(new Paragraph("Generated by CreatorX")
                    .setFontSize(8)
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER));

            document.close();
            log.info("Generated PDF for invoice: {}", invoiceId);
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate PDF for invoice: {}", invoiceId, e);
            throw new RuntimeException("Failed to generate invoice PDF", e);
        }
    }

    /**
     * Convert entity to DTO
     */
    private InvoiceDTO toDTO(Invoice invoice) {
        return InvoiceDTO.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .campaignName(invoice.getCampaignName())
                .brandName(invoice.getBrandName())
                .amount(invoice.getAmount())
                .currency(invoice.getCurrency())
                .status(invoice.getStatus().name().toLowerCase())
                .issueDate(invoice.getIssueDate().format(DATE_FORMATTER))
                .dueDate(invoice.getDueDate().format(DATE_FORMATTER))
                .paidDate(invoice.getPaidDate() != null ? invoice.getPaidDate().format(DATE_FORMATTER) : null)
                .description(invoice.getDescription())
                .build();
    }

    /**
     * Inner DTO for invoice counts
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class InvoiceCountsDTO {
        private long paid;
        private long pending;
        private long overdue;
    }
}
