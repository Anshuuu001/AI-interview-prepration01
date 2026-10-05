package com.elevateai.backend.repository;

import com.elevateai.backend.entity.PersonalMemory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PersonalMemoryRepository extends JpaRepository<PersonalMemory, Long> {
    Optional<PersonalMemory> findByUserId(String userId);
}
