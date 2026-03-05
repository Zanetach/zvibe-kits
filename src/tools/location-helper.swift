import Foundation
import CoreLocation

final class LocationDelegate: NSObject, CLLocationManagerDelegate {
  private let manager = CLLocationManager()
  private let semaphore = DispatchSemaphore(value: 0)
  private var output: String?

  override init() {
    super.init()
    manager.delegate = self
    manager.desiredAccuracy = kCLLocationAccuracyThreeKilometers
  }

  func run(timeoutSeconds: TimeInterval = 2.0) -> String? {
    let status = manager.authorizationStatus
    if status == .notDetermined {
      #if os(macOS)
      manager.requestAlwaysAuthorization()
      #else
      manager.requestWhenInUseAuthorization()
      #endif
    }
    manager.requestLocation()
    _ = semaphore.wait(timeout: .now() + timeoutSeconds)
    return output
  }

  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    guard let loc = locations.last else {
      semaphore.signal()
      return
    }
    output = String(format: "%.6f,%.6f", loc.coordinate.latitude, loc.coordinate.longitude)
    semaphore.signal()
  }

  func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
    semaphore.signal()
  }

  func locationManagerDidChangeAuthorization(_ manager: CLLocationManager) {
    let status = manager.authorizationStatus
    if status == .authorizedAlways {
      manager.requestLocation()
    } else if status == .denied || status == .restricted {
      semaphore.signal()
    }
  }
}

let delegate = LocationDelegate()
if let result = delegate.run(timeoutSeconds: 2.2) {
  print(result)
}
