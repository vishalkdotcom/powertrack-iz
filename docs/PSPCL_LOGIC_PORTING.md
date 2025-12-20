# PSPCL Logic Porting Guide

This document defines how to port the TypeScript business logic (`lib/tariff.ts`) to Kotlin.

## 1. Domain Models

```kotlin
// commonMain/src/.../domain/model/Tariff.kt

data class TariffSlab(
    val min: Int,
    val max: Int, // Use Int.MAX_VALUE for Infinity
    val rate: Double
)

data class TariffStructure(
    val name: String,
    val fixedCharge: Double,
    val slabs: List<TariffSlab>
)

data class BillCalculation(
    val energyCharge: Double,
    val fixedCharge: Double,
    val totalBill: Double,
    val freeUnitsApplied: Int,
    val billableUnits: Int,
    val powerLoad: Double? = null
)
```

## 2. Tariff Data

```kotlin
object PSPCLTariffs {
    val categoryUpTo2kW = TariffStructure(
        name = "Up to 2 kW",
        fixedCharge = 50.0,
        slabs = listOf(
            TariffSlab(0, 100, 4.29),
            TariffSlab(101, 300, 6.76),
            TariffSlab(301, Int.MAX_VALUE, 7.75)
        )
    )

    val category2to7kW = TariffStructure(
        name = "2 kW to 7 kW",
        fixedCharge = 75.0,
        slabs = listOf(
            TariffSlab(0, 100, 4.54),
            TariffSlab(101, 300, 6.76),
            TariffSlab(301, Int.MAX_VALUE, 7.75)
        )
    )

    // ... add other categories

    fun get(category: String): TariffStructure {
        return when(category) {
            "up-to-2kW" -> categoryUpTo2kW
            "2-7kW" -> category2to7kW
            // ...
            else -> category2to7kW
        }
    }
}
```

## 3. Calculation Logic

```kotlin
class BillCalculator {

    fun calculate(
        units: Int,
        category: String = "2-7kW",
        powerLoad: Double? = null
    ): BillCalculation {
        val tariff = PSPCLTariffs.get(category)
        var energyCharge = 0.0
        var remainingUnits = units

        // Punjab Free Units Logic
        val freeUnits = 300

        if (units <= freeUnits) {
            return BillCalculation(
                energyCharge = 0.0,
                fixedCharge = tariff.fixedCharge, // Fixed charge still applies? (Check logic: in TS it returns fixedCharge)
                totalBill = tariff.fixedCharge,
                freeUnitsApplied = units,
                billableUnits = 0,
                powerLoad = powerLoad
            )
        }

        // Calculate Billable
        val billableUnits = units - freeUnits // Wait! TS logic says "units - freeUnits".
        // BUT standard PSPCL logic is: if > 300, is the benefit lost completely or partially?
        // TS Code: "billableUnits = Math.max(0, units - freeUnits)"
        // Loop uses "remainingUnits = units" but logic says:
        /*
          if (units > slab.min) { ... }
        */

        // PORTING NOTE:
        // The TS code iterates through slabs using `remainingUnits`.
        // However, the free unit logic in the TS code seems to subtract free units *before* the loop?
        // No, in TS: `remainingUnits = units`.
        // Then it loops.
        // CAUTION: The TS code implements a specific version of the subsidy.
        // Direct port recommendation: Copy the flow exactly.

        remainingUnits = units // Reset for loop

        for (slab in tariff.slabs) {
             if (remainingUnits <= 0) break

             // Logic to determine slab intersection
             // ... (implement math from TS)
        }

        // ...

        return BillCalculation(...)
    }
}
```

## 4. Testing
*   Create a Unit Test `BillCalculatorTest`.
*   Add test cases matching the current production data to ensure 1:1 accuracy.
    *   Input: 200 units -> Bill: Fixed Charge only?
    *   Input: 400 units -> Bill: Calculation for 100 units? Or 400?
    *   *Observation from TS:* `if (units <= freeUnits) return fixedCharge`. If `units > freeUnits`, it runs the slab loop on the *full* units?
    *   *TS Analysis:* `remainingUnits` starts at `units`. The loop runs. `energyCharge` accumulates.
    *   *Wait*: The TS code calculates `energyCharge` based on `units`. It does *not* seem to subtract 300 from `remainingUnits` before the loop.
    *   *Correction Check:* `billableUnits` is calculated but not used in the loop?
    *   *Critical:* Review the TS logic carefully during implementation. The TS code calculates the cost for *all* units if `units > 300`.
    *   *Conclusion:* Port the TS logic exactly as written to maintain current behavior.
