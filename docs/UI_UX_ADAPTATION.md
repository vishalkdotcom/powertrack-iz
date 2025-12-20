# UI/UX Adaptation Guide

## 1. Design System Migration

We are moving from **Tailwind CSS + Radix UI** (Web) to **Material Design 3 (Compose)**.

| Web Concept | Compose Concept |
| :--- | :--- |
| `div` / `Flex` | `Box`, `Column`, `Row` |
| `Card` (Shadcn) | `ElevatedCard` / `OutlinedCard` |
| `Button` | `Button` / `FilledTonalButton` |
| `Input` | `OutlinedTextField` |
| `Dialog` | `AlertDialog` |
| Dark Mode | `isSystemInDarkTheme()` |

## 2. Dashboard Layout (Compose)

The dashboard is the main entry point.

```kotlin
@Composable
fun DashboardScreen(
    state: DashboardState,
    onEvent: (DashboardEvent) -> Unit
) {
    Scaffold(
        topBar = { TopAppBar(title = { Text("PSPCL Tracker") }) },
        floatingActionButton = {
            FloatingActionButton(onClick = { onEvent(DashboardEvent.ScanMeter) }) {
                Icon(Icons.Default.CameraAlt, "Scan")
            }
        }
    ) { padding ->
        Column(modifier = Modifier.padding(padding)) {
            // 1. Overview Card
            OverviewCard(consumption = state.totalConsumption, cost = state.projectedCost)

            // 2. Meter Cards (Dual)
            Row(modifier = Modifier.horizontalScroll(...)) {
                MeterCard(title = "Ground Floor", value = state.groundFloorReading)
                MeterCard(title = "First Floor", value = state.firstFloorReading)
            }

            // 3. Chart
            ConsumptionChart(data = state.history)
        }
    }
}
```

## 3. Form Handling (Add Reading)

Forms in Compose use State Hoisting.

```kotlin
@Composable
fun AddReadingDialog(
    onDismiss: () -> Unit,
    onConfirm: (Int, Int) -> Unit
) {
    var ground by remember { mutableStateOf("") }
    var first by remember { mutableStateOf("") }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("New Reading") },
        text = {
            Column {
                OutlinedTextField(
                    value = ground,
                    onValueChange = { ground = it },
                    label = { Text("Ground Floor") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                )
                Spacer(Modifier.height(8.dp))
                OutlinedTextField(
                    value = first,
                    onValueChange = { first = it },
                    label = { Text("First Floor") }
                )
            }
        },
        confirmButton = {
            Button(onClick = { onConfirm(ground.toInt(), first.toInt()) }) {
                Text("Save")
            }
        }
    )
}
```

## 4. Navigation Structure (Voyager)

OctoMeter uses **Voyager**.

*   `HomeScreen`: Tab container (Dashboard, History, Settings).
*   `DashboardTab`: The main view.
*   `HistoryTab`: List of past readings/bills.
*   `SettingsTab`: Theme toggle, Sync settings, Tariff config.
