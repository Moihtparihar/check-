import { ethers } from 'ethers';
import { CCIP_NETWORKS, CCIP_ROUTER_CLIENT_ABI } from './consts.js';
/**
 * Gets the chain name from a CCIP chain selector value
 * @param chainSelector The CCIP chain selector value
 * @returns The chain name if found, undefined otherwise
 */
export function getChainNameFromCCIPSelector(chainSelector) {
    for (const [chainName, networkInfo] of Object.entries(CCIP_NETWORKS)) {
        if (networkInfo.chainSelector === chainSelector) {
            return chainName;
        }
    }
    return undefined;
}
/**
 * Gets the CCIP chain selector value for a given chain name
 * @param chainName The name of the chain
 * @returns The CCIP chain selector if found, undefined otherwise
 */
export function getCCIPChainSelector(chainName) {
    return CCIP_NETWORKS[chainName]?.chainSelector;
}
/**
 * Gets the CCIP router address for a given chain name
 * @param chainName The name of the chain
 * @returns The CCIP router address if found, undefined otherwise
 */
export function getCCIPRouterAddress(chainName) {
    return CCIP_NETWORKS[chainName]?.router?.address;
}
/**
 * Gets the list of chains supported by CCIP
 * @returns The list of chain names
 */
export function getCCIPChains() {
    return Object.keys(CCIP_NETWORKS);
}
export const CCIP_HOOK_KEY_PREFIX = 'ccipHook';
export const CCIP_ISM_KEY_PREFIX = 'ccipIsm';
export class CCIPContractCache {
    cachedAddresses = {};
    constructor(addressesMap) {
        if (addressesMap) {
            this.cacheAddressesMap(addressesMap);
        }
    }
    cacheAddressesMap(addressesMap) {
        this.cachedAddresses = addressesMap;
    }
    getAddressesMap() {
        return this.cachedAddresses;
    }
    writeBack(cachedAddresses) {
        for (const [origin, destinations] of Object.entries(this.cachedAddresses)) {
            if (!cachedAddresses[origin]) {
                cachedAddresses[origin] = {};
            }
            for (const [key, address] of Object.entries(destinations)) {
                cachedAddresses[origin][key] = address;
            }
        }
    }
    setHook(origin, destination, ccipHook) {
        if (!this.cachedAddresses[origin]) {
            this.cachedAddresses[origin] = {};
        }
        this.cachedAddresses[origin][`${CCIP_HOOK_KEY_PREFIX}_${destination}`] =
            ccipHook.address;
    }
    setIsm(origin, destination, ccipIsm) {
        if (!this.cachedAddresses[destination]) {
            this.cachedAddresses[destination] = {};
        }
        this.cachedAddresses[destination][`${CCIP_ISM_KEY_PREFIX}_${origin}`] =
            ccipIsm.address;
    }
    getHook(origin, destination) {
        return this.cachedAddresses[origin]?.[`${CCIP_HOOK_KEY_PREFIX}_${destination}`];
    }
    getIsm(origin, destination) {
        return this.cachedAddresses[destination]?.[`${CCIP_ISM_KEY_PREFIX}_${origin}`];
    }
}
export async function isSupportedCCIPLane({ origin, destination, multiProvider, }) {
    const originRouter = getCCIPRouterAddress(origin);
    const destinationSelector = getCCIPChainSelector(destination);
    if (!originRouter || !destinationSelector) {
        return false;
    }
    const signer = multiProvider.getSigner(origin);
    const ccipRouter = new ethers.Contract(originRouter, CCIP_ROUTER_CLIENT_ABI, signer);
    return ccipRouter.isChainSupported(destinationSelector);
}
//# sourceMappingURL=utils.js.map