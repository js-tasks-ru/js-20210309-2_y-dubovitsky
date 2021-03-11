/**
 * sortStrings - sorts array of string by two criteria 'asc' or 'desc'
 * @param {string[]} arr - the array of strings
 * @param {string} [param='asc'] param - the sorting type 'asc' or 'desc'
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
    let result = new Array(...arr);
    result = result.sort(
        (a, b) => compareViaLocales(a, b, ['ru', 'en'])
    );

    return param === 'asc' ? result : result.reverse();
}

function compareViaLocales(a, b, locales) {
    const collator = new Intl.Collator(
        [
            ...locales
        ],
        {
            sensitivity: 'variant',
            caseFirst: 'upper'
        }
    );

    return collator.compare(a, b);
}