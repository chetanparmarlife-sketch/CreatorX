package com.creatorx.service;

import com.creatorx.common.enums.TransactionStatus;
import com.creatorx.common.enums.TransactionType;
import com.creatorx.common.exception.BusinessException;
import com.creatorx.common.exception.ResourceNotFoundException;
import com.creatorx.repository.CampaignRepository;
import com.creatorx.repository.TransactionRepository;
import com.creatorx.repository.UserRepository;
import com.creatorx.repository.WalletRepository;
import com.creatorx.repository.entity.Campaign;
import com.creatorx.repository.entity.Transaction;
import com.creatorx.repository.entity.User;
import com.creatorx.repository.entity.Wallet;
import com.creatorx.service.dto.TransactionDTO;
import com.creatorx.service.dto.WalletDTO;
import com.creatorx.service.mapper.CampaignMapper;
import com.creatorx.service.mapper.TransactionMapper;
import com.creatorx.service.testdata.TestDataBuilder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("WalletService Unit Tests")
class WalletServiceTest {
    
    @Mock
    private WalletRepository walletRepository;
    
    @Mock
    private TransactionRepository transactionRepository;
    
    @Mock
    private UserRepository userRepository;
    
    @Mock
    private CampaignRepository campaignRepository;
    
    @Mock
    private TransactionMapper transactionMapper;
    
    @Mock
    private CampaignMapper campaignMapper;
    
    @InjectMocks
    private WalletService walletService;
    
    private User user;
    private Wallet wallet;
    
    @BeforeEach
    void setUp() {
        user = TestDataBuilder.user()
                .asCreator()
                .withEmail("creator@example.com")
                .build();
        
        wallet = Wallet.builder()
                .user(user)
                .balance(new BigDecimal("1000.00"))
                .pendingBalance(new BigDecimal("500.00"))
                .totalEarned(new BigDecimal("2000.00"))
                .totalWithdrawn(new BigDecimal("1000.00"))
                .build();
    }
    
    @Test
    @DisplayName("Should get wallet successfully")
    void shouldGetWalletSuccessfully() {
        // Given
        when(walletRepository.findByUserId(user.getId()))
                .thenReturn(Optional.of(wallet));
        
        // When
        WalletDTO result = walletService.getWallet(user.getId());
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getAvailableBalance()).isEqualByComparingTo(new BigDecimal("1000.00"));
        assertThat(result.getPendingBalance()).isEqualByComparingTo(new BigDecimal("500.00"));
        assertThat(result.getTotalEarnings()).isEqualByComparingTo(new BigDecimal("2000.00"));
    }
    
    @Test
    @DisplayName("Should throw exception when wallet not found")
    void shouldThrowExceptionWhenWalletNotFound() {
        // Given
        when(walletRepository.findByUserId(user.getId()))
                .thenReturn(Optional.empty());
        
        // When/Then
        assertThatThrownBy(() -> walletService.getWallet(user.getId()))
                .isInstanceOf(ResourceNotFoundException.class);
    }
    
    @Test
    @DisplayName("Should credit wallet successfully")
    void shouldCreditWalletSuccessfully() {
        // Given
        BigDecimal creditAmount = new BigDecimal("100.00");
        when(walletRepository.findByUserIdWithLock(user.getId()))
                .thenReturn(Optional.of(wallet));
        when(walletRepository.save(any())).thenReturn(wallet);
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(campaignRepository.findById(anyString())).thenReturn(Optional.empty());
        when(transactionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        
        // When
        walletService.creditWallet(user.getId(), creditAmount, "Test credit", null);
        
        // Then
        verify(walletRepository).findByUserIdWithLock(user.getId());
        verify(walletRepository).save(any());
        verify(transactionRepository).save(any());
        assertThat(wallet.getBalance()).isEqualByComparingTo(new BigDecimal("1100.00"));
        assertThat(wallet.getTotalEarned()).isEqualByComparingTo(new BigDecimal("2100.00"));
    }
    
    @Test
    @DisplayName("Should create wallet if it doesn't exist on credit")
    void shouldCreateWalletIfNotExistsOnCredit() {
        // Given
        BigDecimal creditAmount = new BigDecimal("100.00");
        when(walletRepository.findByUserIdWithLock(user.getId()))
                .thenReturn(Optional.empty());
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(walletRepository.save(any())).thenAnswer(invocation -> {
            Wallet w = invocation.getArgument(0);
            w.setUserId(user.getId());
            return w;
        });
        when(campaignRepository.findById(anyString())).thenReturn(Optional.empty());
        when(transactionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        
        // When
        walletService.creditWallet(user.getId(), creditAmount, "Test credit", null);
        
        // Then
        verify(walletRepository).save(any(Wallet.class));
    }
    
    @Test
    @DisplayName("Should debit wallet successfully")
    void shouldDebitWalletSuccessfully() {
        // Given
        BigDecimal debitAmount = new BigDecimal("100.00");
        when(walletRepository.findByUserIdWithLock(user.getId()))
                .thenReturn(Optional.of(wallet));
        when(walletRepository.save(any())).thenReturn(wallet);
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(campaignRepository.findById(anyString())).thenReturn(Optional.empty());
        when(transactionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        
        // When
        walletService.debitWallet(user.getId(), debitAmount, "Test debit");
        
        // Then
        verify(walletRepository).findByUserIdWithLock(user.getId());
        verify(walletRepository).save(any());
        assertThat(wallet.getBalance()).isEqualByComparingTo(new BigDecimal("900.00"));
        assertThat(wallet.getTotalWithdrawn()).isEqualByComparingTo(new BigDecimal("1100.00"));
    }
    
    @Test
    @DisplayName("Should throw exception when insufficient balance")
    void shouldThrowExceptionWhenInsufficientBalance() {
        // Given
        BigDecimal debitAmount = new BigDecimal("2000.00");
        when(walletRepository.findByUserIdWithLock(user.getId()))
                .thenReturn(Optional.of(wallet));
        
        // When/Then
        assertThatThrownBy(() -> walletService.debitWallet(user.getId(), debitAmount, "Test debit"))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("Insufficient balance");
    }
    
    @Test
    @DisplayName("Should get available balance")
    void shouldGetAvailableBalance() {
        // Given
        when(walletRepository.findByUserId(user.getId()))
                .thenReturn(Optional.of(wallet));
        
        // When
        BigDecimal result = walletService.getAvailableBalance(user.getId());
        
        // Then
        assertThat(result).isEqualByComparingTo(new BigDecimal("1000.00"));
    }
    
    @Test
    @DisplayName("Should get pending balance")
    void shouldGetPendingBalance() {
        // Given
        when(walletRepository.findByUserId(user.getId()))
                .thenReturn(Optional.of(wallet));
        
        // When
        BigDecimal result = walletService.getPendingBalance(user.getId());
        
        // Then
        assertThat(result).isEqualByComparingTo(new BigDecimal("500.00"));
    }
    
    @Test
    @DisplayName("Should move pending to available balance")
    void shouldMovePendingToAvailableBalance() {
        // Given
        BigDecimal amount = new BigDecimal("200.00");
        when(walletRepository.findByUserIdWithLock(user.getId()))
                .thenReturn(Optional.of(wallet));
        when(walletRepository.movePendingToBalance(eq(user.getId()), eq(amount)))
                .thenReturn(1);
        
        // When
        walletService.movePendingToAvailable(user.getId(), amount);
        
        // Then
        verify(walletRepository).movePendingToBalance(user.getId(), amount);
    }
    
    @Test
    @DisplayName("Should handle concurrent credit operations")
    void shouldHandleConcurrentCreditOperations() throws InterruptedException {
        // Given
        int numberOfThreads = 10;
        BigDecimal creditAmount = new BigDecimal("10.00");
        ExecutorService executor = Executors.newFixedThreadPool(numberOfThreads);
        CountDownLatch latch = new CountDownLatch(numberOfThreads);
        AtomicInteger successCount = new AtomicInteger(0);
        
        when(walletRepository.findByUserIdWithLock(user.getId()))
                .thenReturn(Optional.of(wallet));
        when(walletRepository.save(any())).thenReturn(wallet);
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        when(campaignRepository.findById(anyString())).thenReturn(Optional.empty());
        when(transactionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        
        // When
        for (int i = 0; i < numberOfThreads; i++) {
            executor.submit(() -> {
                try {
                    walletService.creditWallet(user.getId(), creditAmount, "Concurrent credit", null);
                    successCount.incrementAndGet();
                } catch (Exception e) {
                    // Expected in concurrent scenarios
                } finally {
                    latch.countDown();
                }
            });
        }
        
        latch.await();
        executor.shutdown();
        
        // Then
        // All operations should succeed (with pessimistic locking)
        assertThat(successCount.get()).isEqualTo(numberOfThreads);
        verify(walletRepository, atLeast(numberOfThreads)).findByUserIdWithLock(user.getId());
    }
    
    @Test
    @DisplayName("Should get transactions paginated")
    void shouldGetTransactionsPaginated() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Transaction transaction = Transaction.builder()
                .id("txn-id")
                .user(user)
                .type(TransactionType.EARNING)
                .amount(new BigDecimal("100.00"))
                .status(TransactionStatus.COMPLETED)
                .build();
        
        Page<Transaction> transactionPage = new PageImpl<>(List.of(transaction));
        when(transactionRepository.findByUserId(user.getId(), pageable))
                .thenReturn(transactionPage);
        
        TransactionDTO transactionDTO = TransactionDTO.builder()
                .id("txn-id")
                .type(TransactionType.EARNING)
                .amount(new BigDecimal("100.00"))
                .status(TransactionStatus.COMPLETED)
                .build();
        when(transactionMapper.toDTO(any())).thenReturn(transactionDTO);
        
        // When
        Page<TransactionDTO> result = walletService.getTransactions(user.getId(), pageable);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getId()).isEqualTo("txn-id");
    }
}

