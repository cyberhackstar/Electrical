package com.electromart.service;

import com.electromart.dto.AddressRequest;
import com.electromart.dto.AddressResponse;
import com.electromart.entity.Address;
import com.electromart.entity.User;
import com.electromart.exception.ApiException;
import com.electromart.repository.AddressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;

    @Transactional
    public AddressResponse addAddress(User user, AddressRequest request) {
        List<Address> existing = addressRepository.findByUserId(user.getId());
        boolean shouldBeDefault = request.isDefault() || existing.isEmpty();

        if (shouldBeDefault) {
            clearExistingDefault(user.getId());
        }

        Address address = Address.builder()
                .user(user)
                .fullName(request.getFullName())
                .phone(request.getPhone())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .pincode(request.getPincode())
                .country(request.getCountry() != null && !request.getCountry().isBlank() ? request.getCountry()
                        : "India")
                .addressType(request.getAddressType() != null ? request.getAddressType()
                        : com.electromart.entity.AddressType.HOME)
                .isDefault(shouldBeDefault)
                .build();

        addressRepository.save(address);
        return toResponse(address);
    }

    @Transactional
    public AddressResponse updateAddress(User user, Long addressId, AddressRequest request) {
        Address address = getOwnedAddress(user, addressId);

        if (request.isDefault() && !address.isDefault()) {
            clearExistingDefault(user.getId());
        }

        address.setFullName(request.getFullName());
        address.setPhone(request.getPhone());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPincode(request.getPincode());
        if (request.getCountry() != null)
            address.setCountry(request.getCountry());
        if (request.getAddressType() != null)
            address.setAddressType(request.getAddressType());
        address.setDefault(request.isDefault());

        addressRepository.save(address);
        return toResponse(address);
    }

    @Transactional
    public void deleteAddress(User user, Long addressId) {
        Address address = getOwnedAddress(user, addressId);
        boolean wasDefault = address.isDefault();

        addressRepository.delete(address);

        // If the deleted address was default, promote another address to default
        if (wasDefault) {
            List<Address> remaining = addressRepository.findByUserId(user.getId());
            if (!remaining.isEmpty()) {
                Address first = remaining.get(0);
                first.setDefault(true);
                addressRepository.save(first);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> getMyAddresses(User user) {
        return addressRepository.findByUserId(user.getId()).stream().map(this::toResponse).toList();
    }

    private Address getOwnedAddress(User user, Long addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ApiException("Address not found", HttpStatus.NOT_FOUND));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new ApiException("You do not have access to this address", HttpStatus.FORBIDDEN);
        }
        return address;
    }

    private void clearExistingDefault(Long userId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .forEach(a -> {
                    a.setDefault(false);
                    addressRepository.save(a);
                });
    }

    private AddressResponse toResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .fullName(address.getFullName())
                .phone(address.getPhone())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .pincode(address.getPincode())
                .country(address.getCountry())
                .addressType(address.getAddressType())
                .isDefault(address.isDefault())
                .build();
    }
}