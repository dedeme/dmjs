/*
 * Copyright 17-Feb-2017 ºDeme
 *
 * This file is part of 'js17i18n'
 * 'js17i18n' is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License.
 *
 * 'js17i18n' is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with 'js17i18n'. If not, see <http://www.gnu.org/licenses/>.
 */

#include <dm/dm.h>

void i18n_write (Arr *dics, char* i18n, char *src) {
  // Arr<Kv>
  Arr *read_dic(char *lang) {
    Arr *r = arr_new();
    char *tx = file_read(path_cat(i18n, lang, NULL));
    Arr *lines = str_csplit_trim(tx, '\n');

    FNX(make_old, char, l) {
      if (*l && *l != '#') {
        int ix = str_cindex(l, '=');
        if (ix != -1) {
          char *key = str_rtrim(str_sub(l, 0, ix));
          char *value = str_ltrim(str_sub(l, ix + 1, strlen(l)));
          if (*key && *value) {
            arr_add(r, kv_new(key, value));
          }
        }
      }
    }_FN
    it_each(it_from(lines), make_old);
    return r;
  }

  Buf *bf = buf_new();
  buf_add(bf, "// File automatically generated by js17i18n. Don't modify.\n\n");
  buf_add(bf, "const i18nData = { // eslint-disable-line\n");

  int first = 1;
  FNX(add_js, char, lang) {
    if (first) first = 0;
    else buf_add(bf, ",\n");

    buf_add(bf, str_printf("  \"%s\": {", lang));

    int first2 = 1;
    FNX(add_dic, Kv, kv) {
      if (first2) first2 = 0;
      else buf_add(bf, ",");

      buf_add(bf, str_printf("\n    \"%s\": \"%s\"", kv->key, kv->value));
    }_FN
    it_each(it_from(read_dic(lang)), add_dic);

    buf_add(bf, "\n  }");
  }_FN
  it_each(it_from(dics), add_js);

  buf_add(bf, "\n};");

  file_write(path_cat(src, "i18nData.js", NULL), bf->str);
}
