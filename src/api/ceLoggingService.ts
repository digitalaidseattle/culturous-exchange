
/**
 *  CELoggingService.tsx
 *  This service allows conditional logging.  Useful to avoid extraneous logging statements.
 * 
 *  How to use this :
 *  <ol>
 *    <li>add loggingService.debug() like you would console.log</li>
 *     <li>conditionally set logginService.enable = true</li>
 *  </ol>
 *  @copyright 2025 Digital Aid Seattle
 *
 */
import { ConsoleLoggingService } from "@digitalaidseattle/core";

class CELoggingService extends ConsoleLoggingService {
    debug(message?: any, ...optionalParams: any[]): void {
        if (this.enabled) {
            console.log(message, optionalParams)
        }
    }
}
const loggingService = new CELoggingService();
export { loggingService }