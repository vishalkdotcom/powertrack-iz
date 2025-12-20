# Camera Scanning Specification (OCR)

## 1. Feature Goal
Allow the user to scan their physical electricity meter (digital display) to automatically input the reading.

## 2. Technical Approach (Android)

Android is the primary platform for this feature. We will use **Google ML Kit (Text Recognition v2)**.

### Dependencies
```kotlin
// build.gradle.kts (Android Main)
implementation("com.google.mlkit:text-recognition:16.0.0")
implementation("androidx.camera:camera-core:1.3.0")
implementation("androidx.camera:camera-camera2:1.3.0")
implementation("androidx.camera:camera-lifecycle:1.3.0")
implementation("androidx.camera:camera-view:1.3.0")
```

### UX Flow
1.  **Entry Point:** "Scan" button on the Dashboard next to the "Add Reading" input fields.
2.  **Viewfinder:** Opens a full-screen camera view.
    *   Overlay: A rectangular box to guide the user to frame the digits.
3.  **Capture:**
    *   **Option A (Auto):** Continuous frame analysis. When a number with 4-6 digits is detected with high confidence, auto-capture.
    *   **Option B (Manual):** User taps shutter button.
4.  **Confirmation:**
    *   Show a preview of the cropped image.
    *   Show the detected number: "Is this correct? [ 12450 ]"
    *   User can edit if OCR failed slightly.
5.  **Result:** The number is populated into the `groundFloor` or `firstFloor` input field.

## 3. Technical Approach (Desktop)

Scanning a wall meter with a laptop is awkward.
*   **Strategy:** File Upload.
*   User takes photo with phone -> Transfers to PC -> Drags & Drops into App.
*   **Processing:** Can use Tesseract (Java wrapper) or simply treat Desktop as "Manual Entry Only" for v1.

## 4. Implementation Details (Android)

```kotlin
// Pseudocode for Analysis
val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

imageProxy.image?.let { mediaImage ->
    val image = InputImage.fromMediaImage(mediaImage, imageProxy.imageInfo.rotationDegrees)
    recognizer.process(image)
        .addOnSuccessListener { visionText ->
            val detectedText = visionText.text
            // Filter logic: Look for numeric patterns like "\d{4,7}"
            // Filter out noise (often "KWH", "Voltage", etc.)
            extractReading(detectedText)
        }
}
```

## 5. Filtering Logic
Electricity meters often have extra text.
*   **Regex:** `^\d+$` (Strict) or `\d+(\.\d)?` (Decimal)
*   **Heuristics:**
    *   Ignore small numbers (likely voltage/amps).
    *   Compare with *previous* reading (Consumption cannot be negative).
    *   If `detected < previous_reading`, warn the user (Meter rollover or OCR error).
