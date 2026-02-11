import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { PublicKeyCredentialCreationOptionsJSON, PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/types";

// Helper for base64url encoding
function bufferToBase64URLString(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let str = "";
    for (const charCode of bytes) {
        str += String.fromCharCode(charCode);
    }
    const base64 = btoa(str);
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function stringToBase64URLString(str: string): string {
    const bytes = new TextEncoder().encode(str);
    return bufferToBase64URLString(bytes.buffer);
}

export const passkeyService = {
    // Generate a random challenge
    generateChallenge(): string {
        const random = new Uint8Array(32);
        window.crypto.getRandomValues(random);
        return bufferToBase64URLString(random.buffer);
    },

    // Check if the device supports WebAuthn
    async isSupported(): Promise<boolean> {
        return (
            typeof window !== 'undefined' &&
            !!(window as any).PublicKeyCredential
        );
    },

    // Register a new passkey (dummy registration for local check)
    async register(username: string): Promise<boolean> {
        try {
            // In a real app, GET /api/auth/register-options
            const challenge = this.generateChallenge();

            const options: PublicKeyCredentialCreationOptionsJSON = {
                challenge,
                rp: {
                    name: "Libelit Wallet",
                    id: window.location.hostname,
                },
                user: {
                    id: stringToBase64URLString(username),
                    name: username,
                    displayName: username,
                },
                pubKeyCredParams: [
                    { alg: -7, type: "public-key" }, // ES256
                    { alg: -257, type: "public-key" }, // RS256
                ],
                authenticatorSelection: {
                    // authenticatorAttachment: "platform", // Allow roaming authenticators too (e.g. YubiKey) or platform if available
                    userVerification: "preferred", // Changed from required to preferred to reduce friction if not strictly needed
                    residentKey: "required",
                    requireResidentKey: true,
                },
                timeout: 60000,
                attestation: "none",
            };

            const credential = await startRegistration({ optionsJSON: options });
            console.log("Passkey registered:", credential);
            return true;
        } catch (error) {
            console.error("Passkey registration failed:", error);
            return false;
        }
    },

    // Authenticate with passkey
    async authenticate(): Promise<boolean> {
        try {
            // In a real app, GET /api/auth/login-options
            const challenge = this.generateChallenge();

            const options: PublicKeyCredentialRequestOptionsJSON = {
                challenge,
                rpId: window.location.hostname,
                userVerification: "required",
                timeout: 60000,
            };

            const credential = await startAuthentication({ optionsJSON: options });
            console.log("Passkey authenticated:", credential);
            return true;
        } catch (error) {
            console.error("Passkey authentication failed:", error);
            return false;
        }
    }
};
