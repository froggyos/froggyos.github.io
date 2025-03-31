const presetLanguagesMap = {
    // general stuff ==========================
    "T_froggy_doesnt_like": {
        eng: "Froggy doesn't like that. >:(",
        nmt: "Froggy gehana ilu >:(",
        jpn: "フロッギーはそれが気に入らないよ >:("
    },
    "T_doesnt_know |||[]|||": {
        eng: `Froggy doesn't know "|||[]|||", sorry.`,
        nmt: `Froggy gepele "|||[]|||", mbayu`,
        jpn: "T_doesnt_know |||[]|||"
    },
    "T_hello_froggy": {
        eng: "Hello, I'm Froggy! ^v^",
        nmt: "katálo, mo Froggy! ^v^",
        jpn: "どうも、フロッギーです！^v^"
    },
    "T_nmt_greeting_1": {
        eng: "Type ‘help’ to receive support with commands, and possibly navigation.",
        nmt: "nenta ‘help’ mbo süm fesúāte kole komandda me, nam giwa 'ata",
        jpn: "T_nmt_greeting_1"
    },
    "T_nmt_greeting_2 |||[]|||": {
        eng: "* Welcome to froggyOS, version |||[]||| *",
        nmt: "* wulë froggyOS, kekyene |||[]||| *",
        jpn: "T_nmt_greeting_2 |||[]|||"
    },

    // basic command help ====================
    "T_basic_commands_intro": {
        eng: "* A few basic froggyOS commands *",
        nmt: "* tine hatsamwa komandda me o-froggyOS *",
        jpn: "* いくつかの基本的な𝚏𝚛𝚘𝚐𝚐𝚢𝙾𝚂コマンド *"
    },
    "T_basic_commands_lang": {
        eng: "changelanguage [code]. . . . . Changes the current language.",
        nmt: "changelanguage [koda]. . .. . . . . lohi mëzte",
        jpn: "𝚌𝚑𝚊𝚗𝚐𝚎𝚕𝚊𝚗𝚐𝚞𝚊𝚐𝚎 [コード] . . 現在の言語を変更する"
    },
    "T_basic_commands_palette": {
        eng: "changepalette [palette]. . . . Changes the color palette.",
        nmt: "changepalette [paleta] . .. . . . . lohi pesezte paleta",
        jpn: "𝚌𝚑𝚊𝚗𝚐𝚎𝚙𝚊𝚕𝚎𝚝𝚝𝚎 [パレット] . . カラーパレットを変更する"
    },
    "T_basic_commands_clear": {
        eng: "clear. . . . . . . . . . . . . Clears the terminal output.",
        nmt: "clear . . . . . . . . . . . . . . . nggave taminalu tuha",
        jpn: "𝚌𝚕𝚎𝚊𝚛 . . 端末の出力をクリアする"
    },
    "T_basic_commands_clone": {
        eng: "clone [file] . . . . . . . . . Clones a file.",
        nmt: "T_basic_commands_clone",
        jpn: "T_basic_commands_clone"
    },
    "T_basic_commands_clearstate": {
        eng: "clearstate . . . . . . . . . . Clears froggyOS state.",
        nmt: "clearstate. . . . . . . . . . . . . ngátiwi satéte o-froggyOS",
        jpn: "𝚌𝚕𝚎𝚊𝚛𝚜𝚝𝚊𝚝𝚎 . . 𝚏𝚛𝚘𝚐𝚐𝚢𝙾𝚂の状態をクリアする"
    },
    "T_basic_commands_croak": {
        eng: "croak [file] . . . . . . . . . Deletes the file.",
        nmt: "croak [fiyala]. . . . . . . . . . . nggave fiyala",
        jpn: "𝚌𝚛𝚘𝚊𝚔 [ファイル] . . ファイルを削除する"
    },
    "T_basic_commands_formattime": {
        eng: "formattime [format]. . . . . . Changes the time format.",
        nmt: "formattime [folamata] . . . . . . . lohi lohí folamata",
        jpn: "𝚏𝚘𝚛𝚖𝚊𝚝𝚝𝚒𝚖𝚎 [形式] . . 時間形式を変更する"
    },
    "T_basic_commands_hatch": {
        eng: "hatch [file] . . . . . . . . . Creates a file.",
        nmt: "hatch [fiyala]. . . . . . . . . . . mbeno fiyala",
        jpn: "𝚑𝚊𝚝𝚌𝚑 [ファイル] . . ファイルを作成する"
    },
    "T_basic_commands_hello": {
        eng: "hello. . . . . . . . . . . . . Displays a greeting message.",
        nmt: "hello . . . . . . . . . . . . . . . nenta wüle mem",
        jpn: "𝚑𝚎𝚕𝚕𝚘 . . 挨拶のメッセージを表示する"
    },
    "T_basic_commands_help": {
        eng: "help . . . . . . . . . . . . . Displays this message.",
        nmt: "help. . . . . . . . . . . . . . . . nenta lu mem",
        jpn: "𝚑𝚎𝚕𝚙 . . このメッセージを表示する"
    },
    "T_basic_commands_hop": {
        eng: "hop [directory]. . . . . . . . Moves to a directory.",
        nmt: "hop [dilekatüli]. . . . . . . . . . tsi was dilekatüli",
        jpn: "𝚑𝚘𝚙 [ディレクトリ] . . ディレクトリに移動する"
    },
    "T_basic_commands_list": {
        eng: "list . . . . . . . . . . . . . Lists files and subdirectories in the current :sp31:directory.",
        nmt: "list. . . . . . . . . . . . . . . . seyaya fiyala me nam dilekatülilala ilo :sp36:dilekatüli wa",
        jpn: "𝚕𝚒𝚜𝚝 . . 現在のディレクトリ内のファイルとサブディレクトリを表示する"
    },
    "T_basic_commands_listdrives": {
        eng: "listdrives . . . . . . . . . . Lists all drives.",
        nmt: "listdrives. . . . . . . . . . . . . seyaya ká'ono dalayavu me",
        jpn: "𝚕𝚒𝚜𝚝𝚍𝚛𝚒𝚟𝚎𝚜 . . 全てのドライブを表示する"
    },
    "T_basic_commands_loadstate": {
        eng: "loadstate. . . . . . . . . . . Load froggyOS state.",
        nmt: "loadstate . . . . . . . . . . . . . nagyu satéte o-froggyOS",
        jpn: "𝚕𝚘𝚊𝚍𝚜𝚝𝚊𝚝𝚎 . . 𝚏𝚛𝚘𝚐𝚐𝚢𝙾𝚂の状態をロードする"
    },
    "T_basic_commands_meta": {
        eng: "meta [file]. . . . . . . . . . Edits a file.",
        nmt: "meta [fiyala] . . . . . . . . . . . lohi fiyala kili'ocyá",
        jpn: "𝚖𝚎𝚝𝚊 [ファイル] . . ファイルを編集する"
    },
    "T_basic_commands_metaprop": {
        eng: "metaprop [file] [perm] [0/1] . Edits a file's properties.",
        nmt: "metaprop [fiyala] [popatí] [0/1]. . lohi fiyala oəpopatí me",
        jpn: "𝚖𝚎𝚝𝚊𝚙𝚛𝚘𝚙 [ファイル] [権限] [0/1] . . ファイルのプロパティを変更する"
    },
    "T_basic_commands_opendoc": {
        eng: "opendocumentation. . . . . . . Opens the froggyOS documentation.",
        nmt: "opendocumentation . . . . . . . . . ndo dokumenndasiyon o-froggyOS",
        jpn: "𝚘𝚙𝚎𝚗𝚍𝚘𝚌𝚞𝚖𝚎𝚗𝚝𝚊𝚝𝚒𝚘𝚗 . . 𝚏𝚛𝚘𝚐𝚐𝚢𝙾𝚂のマニュアルを開く"
    },
    "T_basic_commands_rename": {
        eng: "rename [file] [new_name] . . . Renames the file.",
        nmt: "T_basic_commands_rename",
        jpn: "T_basic_commands_rename"
    },
    "T_basic_commands_ribbit": {
        eng: "ribbit [text]. . . . . . . . . Displays the text.",
        nmt: "ribbit [meməpelezwisi]. . . . . . . nenta meməpelezwisi",
        jpn: "𝚛𝚒𝚋𝚋𝚒𝚝 [テキスト] . . テキストを表示する"
    },
    "T_basic_commands_savestate": {
        eng: "savestate. . . . . . . . . . . Save froggyOS state.",
        nmt: "savestate . . . . . . . . . . . . . bátsiyo satéte o-froggyOS",
        jpn: "𝚜𝚊𝚟𝚎𝚜𝚝𝚊𝚝𝚎 . . 𝚏𝚛𝚘𝚐𝚐𝚢𝙾𝚂の状態をセーブする"
    },
    "T_basic_commands_spawn": {
        eng: "spawn [directory]. . . . . . . Creates a directory.",
        nmt: "spawn [dilekatüli]. . . . . . . . . mbeno dilekatüli",
        jpn: "𝚜𝚙𝚊𝚠𝚗 [ディレクトリ] . . ディレクトリを作成する"
    },
    "T_basic_commands_spy": {
        eng: "spy [file] . . . . . . . . . . Reads the file and outputs it to the terminal.",
        nmt: "spy [fiyala]. . . . . . . . . . . . sensa fiyala nam nenta lu taminalu wa",
        jpn: "𝚜𝚙𝚢 [ファイル] . . ファイルを読み取る"
    },
    "T_basic_commands_swimto": {
        eng: "swimto [program] . . . . . . . Start a program.",
        nmt: "swimto [program]. . . . . . . . . . igyensa pógám",
        jpn: "𝚜𝚠𝚒𝚖𝚝𝚘 [プログラム] . . プログラムを開始する"
    },
    /*
    basic model:
    provide ...
    ... does not exit
    ... already exists
    other errors (ex. ... not found, invalid, no permission)
    other non-errors (ex. available ...)
    success(es)
    */

    // state ====================================
    "T_no_state_found": {
        eng: "No state found.",
        nmt: "satéte gewitsu mana",
        jpn: "状態が見つかりませんでした"
    },
    "T_no_urgent_state_found": {
        eng: "No urgent state found.",
        nmt: "satéte apelelala gewitsu mana",
        jpn: "T_no_urgent_state_found"
    },
    "T_state_cleared": {
        eng: "State cleared.",
        nmt: "satéte ngátiwi mana",
        jpn: "状態がクリアされました"
    },
    "T_state_loaded": {
        eng: "State loaded.",
        nmt: "satéte nagyu mana",
        jpn: "状態がロードされました"
    },
    "T_state_saved": {
        eng: "State saved. May need to loadstate for some changes to take effect.",
        nmt: `satéte bátsiyo mana. kana "loadstate" ma lohiəte me fene`,
        jpn: "T_state_saved"
    },

    // file =====================================
    "T_provide_file_name": {
        eng: "Please provide a file name.",
        nmt: "apelelala som fiyala tama",
        jpn: "ファイル名を入力してください"
    },
    "T_provide_file_name_and_new": {
        eng: "Please provide a file name and a new name.",
        nmt: "apelelala som fiyala tama nam sana tama",
        jpn: "T_provide_file_name_and_new"
    },
    "T_file_does_not_exist": {
        eng: "File does not exist.",
        nmt: "fiyala getsefese",
        jpn: "ファイルは存在しません"
    },
    "T_file_already_exists": {
        eng: "File already exists.",
        nmt: "fiyala tsefese",
        jpn: "ファイルは既に存在します"
    },
    "T_file_name_already_exists": {
        eng: "File with that name already exists in this directory.",
        nmt: "tama oəfiyala tsefese dilekatüli wa",
        jpn: "T_file_name_already_exists"
    },
    "T_file_name_not_3_char": {
        eng: "File name must be exactly 3 characters long.",
        nmt: "T_file_name_not_3_char",
        jpn: "T_file_name_not_3_char"
    },
    "T_no_permission_to_edit_file": {
        eng: "You do not have permission to edit this file.",
        nmt: "T_no_permission_to_edit_file",
        jpn: "このファイルを変更する権限がありません"
    },
    "T_no_permission_to_read_file": {
        eng: "You do not have permission to read this file.",
        nmt: "T_no_permission_to_read_file",
        jpn: "T_no_permission_to_read_file"
    },
    "T_no_permission_to_clone": {
        eng: "You do not have permission to clone this file.",
        nmt: "T_no_permission_to_clone",
        jpn: "T_no_permission_to_clone"
    },
    "T_no_permission_to_rename_file": {
        eng: "You do not have permission to rename this file.",
        nmt: "T_no_permission_to_rename_file",
        jpn: "T_no_permission_to_rename_file"
    },
    "T_no_permission_to_delete_file": {
        eng: "You do not have permission to delete this file.",
        nmt: "na gewitsu pamason nggave ilo fiyala",
        jpn: "このファイルを削除する権限がありません"
    },
    "T_cannot_delete_file": {
        eng: "You cannot delete this file.",
        nmt: "'a genggave ilo fiyala",
        jpn: "このファイルは削除できません"
    },
    "T_available_properties": {
        eng: "* Available properties *",
        nmt: "T_available_properties",
        jpn: "T_available_properties"
    },
    "T_file_created": {
        eng: "File created.",
        nmt: "fiyala mbeno mana",
        jpn: "ファイルを作成しました"
    },
    "T_file_cloned |||[]|||": {
        eng: `File "|||[]|||" cloned.`,
        nmt: "T_file_cloned |||[]|||",
        jpn: "T_file_cloned |||[]|||"
    },
    "T_file_renamed": {
        eng: "File renamed.",
        nmt: "T_file_renamed",
        jpn: "T_file_renamed"
    },
    "T_file_deleted": {
        eng: "File deleted.",
        nmt: "T_file_deleted",
        jpn: "T_file_deleted"
    },

    // time format ====================================
    "T_provide_time_format": {
        eng: "Please provide a time format.",
        nmt: "apelelala som lohí folamata",
        jpn: "時間形式を入力してください"
    },

    // directory =====================================
    "T_provide_directory_name": {
        eng: "Please provide a directory name.",
        nmt: "apelelala som dilekatüli tama",
        jpn: "ディレクトリ名を入力してください"
    },
    "T_directory_does_not_exist": {
        eng: "Directory does not exist.",
        nmt: "dilekatüli getsefese",
        jpn: "ディレクトリは存在しません"
    },
    "T_directory_already_exists": {
        eng: "Directory already exists.",
        nmt: "T_directory_already_exists",
        jpn: "T_directory_already_exists"
    },
    "T_directory_empty": {
        eng: "This directory is empty.",
        nmt: "ilo wa dilekatüli säna",
        jpn: "このディレクトリは空です"
    },
    "T_cannot_create_directories": {
        eng: "You cannot create directories in this directory.",
        nmt: "T_cannot_create_directories",
        jpn: "T_cannot_create_directories"
    },
    "T_directory_created": {
        eng: "Directory created.",
        nmt: "T_directory_created",
        jpn: "T_directory_created"
    },

    // palette ====================================
    "T_provide_palette_name": {
        eng: "Please provide a color palette name.",
        nmt: "apelelala som fiyala tama",
        jpn: "カラーパレット名を入力してください"
    },
    "T_color_palette_does_not_exist": {
        eng: "Color palette does not exist.",
        nmt: "pesezte paleta getsefese",
        jpn: "カラーパレットは存在しません"
    },
    "T_palette_error_invalid_hex |||[]|||": {
        eng: "PaletteError: |||[]||| is an invalid hex color.",
        nmt: "PaletaGogowa: |||[]||| wa sepu hex pesezte",
        jpn: "パレットエラー: |||[]|||は無効な16進カラーコードです"
    },
    "T_could_not_create_palette": {
        eng: "Could not create palette.",
        nmt: "gembeno paleta",
        jpn: "パレットを作成できません"
    },
    "T_available_color_palettes": {
        eng: "* Available color palettes *",
        nmt: "* pesezte paleta me *",
        jpn: "* 使用可能なカラーパレット *"
    },

    // macro =====================================
    "T_provide_macro_name": {
        eng: "Please provide a macro name.",
        nmt: "apelelala som makulo tama",
        jpn: "マクロ名を入力してください"
    },
    "T_macro_does_not_exist": {
        eng: "Macro does not exist.",
        nmt: "makulo getsefese",
        jpn: "マクロが存在しません"
    },
    "T_no_macros_found": {
        eng: "No macros found.",
        nmt: "makulo gewitsu mana",
        jpn: "マクロが見つかりませんでした"
    },
    "T_available_macros": {
        eng: "* Available macros *",
        nmt: "* makulo me *",
        jpn: "* 使用可能なマクロ *"
    },

    // program =====================================
    "T_provide_valid_program": {
        eng: "Please provide a valid program.",
        nmt: "T_provide_valid_program",
        jpn: "T_provide_valid_program"
    },
    "T_no_permission_to_run_program": {
        eng: "You do not have permission to run this program.",
        nmt: "T_no_permission_to_run_program",
        jpn: "T_no_permission_to_run_program"
    },
    "T_available_programs": {
        eng: "* Available programs *",
        nmt: "T_available_programs",
        jpn: "T_available_programs"
    },

    // spinner ====================================
    "T_spinner_does_not_exist": {
        eng: "Spinner does not exist.",
        nmt: "T_spinner_does_not_exist",
        jpn: "T_spinner_does_not_exist"
    },
    "T_available_spinners": {
        eng: "* Available spinners *",
        nmt: "T_available_spinners",
        jpn: "T_available_spinners"
    },

    // lang =====================================
    "T_provide_lang_code": {
        eng: "Please provide a language code.",
        nmt: "apelelala som mëzte koda",
        jpn: "T_provide_lang_code"
    },
    "T_lang_does_not_exist |||[]|||": {
        eng: `Language with code "|||[]|||" does not exist.`,
        nmt: `mëzte kole "|||[]|||" getsefese`,
        jpn: "T_lang_does_not_exist |||[]|||"
    },
    "T_invalid_lang_file |||[]|||": {
        eng: `Invalid language file with code "|||[]|||".`,
        nmt: "T_invalid_lang_file |||[]|||",
        jpn: "T_invalid_lang_file |||[]|||"
    },
    "T_current_lang_invalid": {
        eng: `Current language file is INVALID! Switching to "lbh".`,
        nmt: `T_current_lang_invalid`,
        jpn: `T_current_lang_invalid`
    },
    "T_invalid_lang": {
        eng: "INVALID",
        nmt: "T_invalid_lang",
        jpn: "T_invalid_lang"
    },
    "T_available_langs": {
        eng: "* Available languages *",
        nmt: "* mëzte me *",
        jpn: "T_available_langs"
    },
    "T_lang_changed": {
        eng: "Language changed.",
        nmt: "mëzte lohi mana",
        jpn: "T_lang_changed"
    },

    /// miscellaneous provide ... ====================================
    "T_provide_valid_property_type": {
        eng: "Please provide a valid property type.",
        nmt: "T_provide_valid_property_type",
        jpn: "T_provide_valid_property_type"
    },
    "T_provide_valid_value_0_1": {
        eng: "Please provide a valid value. 0 or 1.",
        nmt: "T_provide_valid_value_0_1",
        jpn: "T_provide_valid_value_0_1"
    },
    "T_provide_text_to_display": {
        eng: "Please provide text to display.",
        nmt: "T_provide_text_to_display",
        jpn: "T_provide_text_to_display"
    },
    "T_provide_path": {
        eng: "Please provide a path.",
        nmt: "T_provide_path",
        jpn: "T_provide_path"
    },
    "T_invalid_args_provide_1_0": {
        eng: "Invalid argument. Please provide '1' or '0'.",
        nmt: "T_invalid_args_provide_1_0",
        jpn: "T_invalid_args_provide_1_0"
    },

    // lilypad ====================================
    "T_lilypad_save_exit": {
        eng: "* press ESC to save and exit lilypad *",
        nmt: "T_lilypad_save_exit",
        jpn: "T_lilypad_save_exit"
    },
    "T_lilypad_exit": {
        eng: "* press ESC to exit lilypad *",
        nmt: "T_lilypad_exit",
        jpn: "T_lilypad_exit"
    },
    "T_saving_file": {
        eng: "Saving file...",
        nmt: "T_saving_file",
        jpn: "T_saving_file"
    },
    "T_saving_done": {
        eng: "Done! ^v^",
        nmt: "T_saving_done",
        jpn: "T_saving_done"
    },

    // misc success =========================
    "T_properties_updated": {
        eng: "Properties updated.",
        nmt: "T_properties_updated",
        jpn: "T_properties_updated"
    },
    "T_documentation_opened": {
        eng: "Documentation opened in a new window.",
        nmt: "T_documentation_opened",
        jpn: "T_documentation_opened"
    },

    // misc error/fail =========================
    "T_arg_too_long": {
        eng: "The argument is too long.",
        nmt: "ágayuménta na'ë kékene",
        jpn: "引数が長すぎます"
    },
    "T_missing_file_args": {
        eng: "Missing file argument(s).",
        nmt: "T_missing_file_args",
        jpn: "ファイルの引数が不足しています"
    },
    "T_invalid_format_object_inter_rule_delimiter": {
        eng: "Invalid FormatObject (INTER-RULE DELIMITER) syntax.",
        nmt: "gogowa FormatObject (LU GAYANA MEMƏPELEWISI) sebesikya",
        jpn: "無効なフォーマットオブジェクト（インター・ルール・デリミター）構文です"
    },
    "T_error_data_unavailable": {
        eng: "Error Data UNAVAILABLE",
        nmt: "gogowa data UNAYAVA",
        jpn: "エラーデータは利用できません"
    },

    // bullfrog commands =========================
    "T_bullfrog_commands_intro": {
        eng: "* A few bullfrog commands *",
        nmt: "T_bullfrog_commands_intro",
        jpn: "T_bullfrog_commands_intro"
    },
    "T_bullfrog_commands_changepath": {
        eng: "[[BULLFROG]]changepath [path] - Changes the path of the terminal",
        nmt: "T_bullfrog_commands_changepath",
        jpn: "T_bullfrog_commands_changepath"
    },
    "T_bullfrog_commands_greeting": {
        eng: "[[BULLFROG]]greeting - Displays the greeting message",
        nmt: "T_bullfrog_commands_greeting",
        jpn: "T_bullfrog_commands_greeting"
    },
    "T_bullfrog_commands_help": {
        eng: "[[BULLFROG]]help - Displays this message",
        nmt: "T_bullfrog_commands_greeting",
        jpn: "T_bullfrog_commands_greeting"
    },
    "T_bullfrog_commands_setstatbar": {
        eng: "[[BULLFROG]]setstatbar [text] - Changes the text in the status bar",
        nmt: "T_bullfrog_commands_setstatbar",
        jpn: "T_bullfrog_commands_setstatbar"
    },
    "T_bullfrog_commands_statbarlock": {
        eng: "[[BULLFROG]]statbarlock [0/1] - Locks the status bar from updating",
        nmt: "T_bullfrog_commands_statbarlock",
        jpn: "T_bullfrog_commands_statbarlock"
    },
    "T_bullfrog_commands_showspinner": {
        eng: "[[BULLFROG]]showspinner [0/1] - Toggles the loading spinner",
        nmt: "T_bullfrog_commands_showspinner",
        jpn: "T_bullfrog_commands_showspinner"
    },
    "T_bullfrog_commands_debugmode": {
        eng: "[[BULLFROG]]debugmode [0/1] - Toggles debug mode",
        nmt: "T_bullfrog_commands_debugmode",
        jpn: "T_bullfrog_commands_debugmode"
    },
    "T_bullfrog_commands_setspinner": {
        eng: "[[BULLFROG]]setspinner [spinner] - Changes the loading spinner",
        nmt: "T_bullfrog_commands_setspinner",
        jpn: "T_bullfrog_commands_setspinner"
    },
    "T_bullfrog_commands_usavestate": {
        eng: "[[BULLFROG]]urgentsavestate - saves state for reloading",
        nmt: "T_bullfrog_commands_usavestate",
        jpn: "T_bullfrog_commands_usavestate"
    },
    "T_bullfrog_commands_uloadstate": {
        eng: "[[BULLFROG]]urgentloadstate - loads state for reloading",
        nmt: "T_bullfrog_commands_uloadstate",
        jpn: "T_bullfrog_commands_uloadstate"
    },
    "T_bullfrog_commands_uclearstate": {
        eng: "[[BULLFROG]]urgentclearstate - clears reload state",
        nmt: "T_bullfrog_commands_uclearstate",
        jpn: "T_bullfrog_commands_uclearstate"
    },
    "T_bullfrog_commands_autoloadstate": {
        eng: "[[BULLFROG]]autoloadstate - loads state",
        nmt: "T_bullfrog_commands_autoloadstate",
        jpn: "T_bullfrog_commands_autoloadstate"
    },
    "T_bullfrog_commands_vlang": {
        eng: "[[BULLFROG]]validatelanguage - checks if the current language is valid",
        nmt: "T_bullfrog_commands_vlang",
        jpn: "T_bullfrog_commands_vlang"
    },

    // date and time =========================
    "T_date_short_sunday": {
        eng: "Sun",
        nmt: "ypg",
        jpn: "T_date_short_sunday"
    },
    "T_date_short_monday": {
        eng: "Mon",
        nmt: "ypl",
        jpn: "T_date_short_monday"
    },
    "T_date_short_tuesday": {
        eng: "Tue",
        nmt: "ypb",
        jpn: "T_date_short_tuesday"
    },
    "T_date_short_wednesday": {
        eng: "Wed",
        nmt: "yps",
        jpn: "T_date_short_wednesday"
    },
    "T_date_short_thursday": {
        eng: "Thu",
        nmt: "ypk",
        jpn: "T_date_short_thursday"
    },
    "T_date_short_friday": {
        eng: "Fri",
        nmt: "ypm",
        jpn: "T_date_short_friday"
    },
    "T_date_short_saturday": {
        eng: "Sat",
        nmt: "ypw",
        jpn: "T_date_short_saturday"
    },
    "T_date_long_sunday": {
        eng: "Sunday",
        nmt: "yepë-gela",
        jpn: "T_date_long_sunday"
    },
    "T_date_long_monday": {
        eng: "Monday",
        nmt: "yepë-la",
        jpn: "T_date_long_monday"
    },
    "T_date_long_tuesday": {
        eng: "Tuesday",
        nmt: "yepë-bese",
        jpn: "T_date_long_tuesday"
    },
    "T_date_long_wednesday": {
        eng: "Wednesday",
        nmt: "yepë-sála",
        jpn: "T_date_long_wednesday"
    },
    "T_date_long_thursday": {
        eng: "Thursday",
        nmt: "yepë-kimi",
        jpn: "T_date_long_thursday"
    },
    "T_date_long_friday": {
        eng: "Friday",
        nmt: "yepë-molo",
        jpn: "T_date_long_friday"
    },
    "T_date_long_saturday": {
        eng: "Saturday",
        nmt: "yepë-wé",
        jpn: "T_date_long_saturday"
    },
    "T_date_short_january": {
        eng: "Jan",
        nmt: "ygl",
        jpn: "T_date_short_january"
    },
    "T_date_short_february": {
        eng: "Feb",
        nmt: "yla",
        jpn: "T_date_short_february"
    },
    "T_date_short_march": {
        eng: "Mar",
        nmt: "ybs",
        jpn: "T_date_short_march"
    },
    "T_date_short_april": {
        eng: "Apr",
        nmt: "ysl",
        jpn: "T_date_short_april"
    },
    "T_date_short_may": {
        eng: "May",
        nmt: "ykm",
        jpn: "T_date_short_may"
    },
    "T_date_short_june": {
        eng: "Jun",
        nmt: "yml",
        jpn: "T_date_short_june"
    },
    "T_date_short_july": {
        eng: "Jul",
        nmt: "ywé",
        jpn: "T_date_short_july"
    },
    "T_date_short_august": {
        eng: "Aug",
        nmt: "yan",
        jpn: "T_date_short_august"
    },
    "T_date_short_september": {
        eng: "Sep",
        nmt: "ymk",
        jpn: "T_date_short_september"
    },
    "T_date_short_october": {
        eng: "Oct",
        nmt: "ykó",
        jpn: "T_date_short_october"
    },
    "T_date_short_november": {
        eng: "Nov",
        nmt: "ykg",
        jpn: "T_date_short_november"
    },
    "T_date_short_december": {
        eng: "Dec",
        nmt: "ykl",
        jpn: "T_date_short_december"
    },
    "T_date_long_january": {
        eng: "January",
        nmt: "yepëlili-gela",
        jpn: "T_date_long_january"
    },
    "T_date_long_february": {
        eng: "February",
        nmt: "yepëlili-la",
        jpn: "T_date_long_february"
    },
    "T_date_long_march": {
        eng: "March",
        nmt: "yepëlili-bese",
        jpn: "T_date_long_march"
    },
    "T_date_long_april": {
        eng: "April",
        nmt: "yepëlili-sála",
        jpn: "T_date_long_april"
    },
    "T_date_long_may": {
        eng: "May",
        nmt: "yepëlili-kimi",
        jpn: "T_date_long_may"
    },
    "T_date_long_june": {
        eng: "June",
        nmt: "yepëlili-molo",
        jpn: "T_date_long_june"
    },
    "T_date_long_july": {
        eng: "July",
        nmt: "yepëlili-wé",
        jpn: "T_date_long_july"
    },
    "T_date_long_august": {
        eng: "August",
        nmt: "yepëlili-ana",
        jpn: "T_date_long_august"
    },
    "T_date_long_september": {
        eng: "September",
        nmt: "yepëlili-miki",
        jpn: "T_date_long_september"
    },
    "T_date_long_october": {
        eng: "October",
        nmt: "yepëlili-kó",
        jpn: "T_date_long_october"
    },
    "T_date_long_november": {
        eng: "November",
        nmt: "yepëlili-kó-nam-gela",
        jpn: "T_date_long_november"
    },
    "T_date_long_december": {
        eng: "December",
        nmt: "yepëlili-kó-nam-la",
        jpn: "T_date_long_december"
    },

    // uncategorized messages ==========================

};

const config = {
    // settings as files
    debugMode: null,
    version: null,
    colorPalette: null,
    showSpinner: null,
    currentSpinner: null,
    timeFormat: null,
    updateStatBar: null,
    allowedProgramDirectories: null,
    dissallowSubdirectoriesIn: null,
    language: null,
    validateLanguageOnStartup: null,

    // immutable settings
    currentPath: 'C:/Home',
    commandHistory: [],
    commandHistoryIndex: -1,
    spinnerIndex: 0,
    currentProgram: "cli",
    savingFile: false,
    programList: ["cli", "lilypad"],
    programSession: 0,
    errorText: "<span class='error'><span class='error-text'>!!ERROR!!</span> -</span>",
    translationErrorText: "<span class='error'><span class='t-error-text'>!!TRANSLATION ERROR!!</span> -</span>",
    translationWarningText: "<span class='error'><span class='t-warning-text'>!TRANSLATION WARNING!</span> -</span>",

    // filesystem
    fileSystem: {
        "Config:": [
            { name: "language", properties: {transparent: false, read: true, write: true, hidden: false}, data: ["eng"] },
            { name: "debugMode", properties: {transparent: false, read: true, write: true, hidden: false}, data: ["false"] },
            { name: "colorPalette", properties: {transparent: false, read: true, write: true, hidden: false}, data: ["standard"] },
            { name: "version", properties: {transparent: false, read: true, write: true, hidden: false}, data: ["1.9"] },
            { name: "showSpinner", properties: {transparent: false, read: true, write: true, hidden: false}, data: ["false"] },
            { name: "currentSpinner", properties: {transparent: false, read: true, write: true, hidden: false}, data: ["default"] },
            { name: "timeFormat", properties: {transparent: false, read: true, write: true, hidden: false}, data: ["w. y/mn/d h:m:s"] },
            { name: "updateStatBar", properties: {transparent: false, read: true, write: true, hidden: false}, data: ["true"] },
            { name: "allowedProgramDirectories", properties: {transparent: false, read: true, write: true, hidden: false}, data: ["D:/Programs"] },
            { name: "dissallowSubdirectoriesIn", properties: {transparent: false, read: true, write: true, hidden: false}, data: ["D:/Programs", "D:/Macros", "D:/Program-Data", "D:/Palettes", "D:/Spinners"] },
            { name: "validateLanguageOnStartup", properties: {transparent: false, read: true, write: true, hidden: false}, data: ["true"] }
        ],
        "Config:/lang_files": [
            { name: "lbh", properties: {transparent: true, read: true, write: false, hidden: false}, data: ["{{{LANGNAME_!!!_language build helper}}}"] },
            { name: "eng", properties: {transparent: false, read: true, write: false, hidden: false}, data: ["{{{LANGNAME_!!!_English}}}"] },
            { name: "nmt", properties: {transparent: false, read: true, write: false, hidden: false}, data: ["{{{LANGNAME_!!!_ngimëte}}}"] },
            { name: "jpn", properties: {transparent: false, read: true, write: false, hidden: false}, data: ["{{{LANGNAME_!!!_Japanese}}}"] }
        ],             
        "C:": [],   
        "C:/Home": [
            { name: "welcome!", properties: {transparent: false, read: true, write: true, hidden: false}, data: ['Hello!', "Welcome to FroggyOS.", "Type 'help' for a list of commands.", "Have fun! ^v^"] },
        ],
        "C:/Docs": [],
        "D:": [], 
        "D:/Programs": [
            { name: "cli", properties: {transparent: false, read: false, write: false, hidden: true}, data: ["str cli = 'this program is hardcoded into froggyOS'", "endprog"] },
            { name: "lilypad", properties: {transparent: false, read: false, write: false, hidden: true}, data: ["str lilypad = 'this program is hardcoded into froggyOS'", "endprog"] },
            { name: "test", properties: {transparent: true, read: true, write: true, hidden: false}, data: [
                "out 'meow meow meow :>'",
                "endprog",
            ] },
            { name: "help", properties: {transparent: false, read: true, write: false, hidden: false}, data: [
                "str category = ''",
                "out 'Choose a category: '",
                "prompt 0 category OS File Directory Other",
                "if {v:category == 'OS'}",
                "out 'clearstate. . . .clears froggyOS state'",
                "out 'loadstate . . . .loads froggyOS state'",
                "out 'savestate . . . .saves froggyOS state'",
                "out 'swimto [program] start a program'",
                "endif",
                "if {v:category == 'File'}",
                "out 'croak [file]. . . . . . . . .deletes the file'",
                "out 'hatch [file]. . . . . . . . .creates a file'",
                "out 'meta [file] . . . . . . . . .edits a file'",
                `out "metaprop [file] [perm] [0/1] edits a file's properties"`,
                "out 'spy [file]. . . . . . . . . .reads the file'",
                "endif",
                "if {v:category == 'Directory'}",
                "out 'spawn [directory] creates a directory'",
                "out 'hop [directory]. .moves to a directory'",
                "endif",
                "if {v:category == 'Other'}",
                "out 'changepalette [palette] changes the color palette'",
                "out 'clear. . . . . . . . . .clears the terminal output'",
                "out 'macro [macro]. . . . . .runs a macro'",
                "out 'ribbit [text]. . . . . .displays the text'",
                "out 'formattime [format]. . .changes the time format'",
                "out 'clearterminal' . . . . .clears the terminal output'",
                "endif",
                "endprog",
            ] },
            { name: "kaerugotchi", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                "str currentEmotion = 'default'",
                "str currentAction = 'play'",
                "",
                "int selectedPromptOption = 0",
                "",
                "str quitFailsafe = ''",
                "",
                "int coin = 30",
                "int energy = 60",
                "int hunger = 60",
                "int happiness = 20",
                "",
                "int decayTimer = 0",
                "",
                "str coinDisplay = ''",
                "str energyDisplay = ''",
                "str hungerDisplay = ''",
                "str happinessDisplay = ''",
                "",
                "int energyIterator = 0",
                "int hungerIterator = 0",
                "int happinessIterator = 0",
                "",
                "func body",
                "    out ' (----)'",
                "    out '(>____<)'",
                "    out ' ^^~~^^'",
                "endfunc",
                "",
                "func hungryBody",
                "    out ' (~~~~)'",
                "    out '(>____<)'",
                "    out ' ^^~~^^'",
                "endfunc",
                "",
                "func headDefault",
                "    out '  o..o'",
                "endfunc",
                "",
                "func headDrowsy",
                "    out '  =..='",
                "endfunc",
                "",
                "func headSleepy",
                "    out '  _.._ .zZ'",
                "endfunc",
                "",
                "func headHappy",
                "    out '  ^..^'",
                "endfunc",
                "",
                "func headConfused",
                "    out '  @..@'",
                "endfunc",
                "",
                "func headAngry",
                "    out '  >..<'",
                "endfunc",
                "",
                "func headSad",
                "    out '  q..q'",
                "endfunc",
                "",
                "func headUnamused",
                "    out '  -..-'",
                "endfunc",
                "",
                "",
                "loop { true }",
                "    clearterminal",
                "    set coinDisplay = '     coin:'",
                "    set energyDisplay = '   energy: '",
                "    set hungerDisplay = '   hunger: '",
                "    set happinessDisplay = 'happiness: '",
                "",
                "    set energyIterator = 0",
                "    set hungerIterator = 0",
                "    set happinessIterator = 0",
                "",
                "    loop { v:energyIterator < v:energy }",
                "        append energyDisplay '_'",
                "        set energyIterator = v:energyIterator + 1",
                "    endloop",
                "",
                "    loop {v:hungerIterator < v:hunger}",
                "        append hungerDisplay '_'",
                "        set hungerIterator = v:hungerIterator + 1",
                "    endloop",
                "",
                "    loop {v:happinessIterator < v:happiness}",
                "        append happinessDisplay '_'",
                "        set happinessIterator = v:happinessIterator + 1",
                "    endloop",
                "",
                "    outc {t=c06} 'v:coinDisplay v:coin'",
                "    outc {t=c09 | b=c09, br=11-71} 'v:energyDisplay'",
                "    outc {t=c12 | b=c12, br=11-71} 'v:hungerDisplay'",
                "    outc {t=c13 | b=c13, br=11-71} 'v:happinessDisplay'",
                "",
                "    out ''",
                "",
                "    if {v:currentEmotion == 'sleepy'}",
                "        f: headSleepy",
                "        f: body",
                "    endif",
                "",
                "    if {v:currentEmotion == 'default'}",
                "        f: headDefault",
                "        f: body",
                "    endif",
                "",
                "    if {v:currentEmotion == 'happy'}",
                "        f: headHappy",
                "        f: body",
                "    endif",
                "",
                "    if {v:currentEmotion == 'confused'}",
                "        f: headConfused",
                "        f: body",
                "    endif",
                "",
                "    if {v:currentEmotion == 'angry'}",
                "        f: headAngry",
                "        f: body",
                "    endif",
                "",
                "    if {v:currentEmotion == 'sad'}",
                "        f: headSad",
                "        f: body",
                "    endif",
                "",
                "    if {v:currentEmotion == 'unamused'}",
                "        f: headUnamused",
                "        f: body",
                "    endif",
                "",
                "    if {v:currentEmotion == 'drowsy'}",
                "        f: headDrowsy",
                "        f: body",
                "    endif",
                "",
                "    if {v:currentEmotion == 'hungry'}",
                "        f: headDefault",
                "        f: hungryBody",
                "    endif",
                "",
                "    if {v:currentEmotion == 'very_hungry'}",
                "        f: headConfused",
                "        f: hungryBody",
                "    endif",
                "",
                "    out v:currentEmotion",
                "    prompt selectedPromptOption currentAction play sleep feed work poke [[QUIT]]",
                "",
                "",
                "    if {v:currentAction == 'play'}",
                "        set selectedPromptOption = 0",
                "        if {v:energy > 1 && v:happiness < 60 }",
                "            set happiness = v:happiness + 1",
                "            set energy = v:energy - 1",
                "        endif",
                "    endif",
                "",
                "    if {v:currentAction == 'sleep'}",
                "        set selectedPromptOption = 1",
                "        if {v:hunger > 1 && v:energy < 60 }",
                "            set energy = v:energy + 1",
                "            set hunger = v:hunger - 1",
                "        endif",
                "    endif",
                "",
                "    if {v:currentAction == 'feed'}",
                "        set selectedPromptOption = 2",
                "        if {v:coin > 1 && v:hunger < 60}",
                "            set hunger = v:hunger + 1",
                "            set coin = v:coin - 2",
                "        endif",
                "    endif",
                "",
                "    if {v:currentAction == 'work'}",
                "        set selectedPromptOption = 3",
                "        if {v:energy > 2 && v:hunger > 2 && v:happiness > 2}",
                "            set hunger = v:hunger - 2",
                "            set energy = v:energy - 2",
                "            set happiness = v:happiness - 2",
                "            set coin = v:coin + 10",
                "        endif",
                "    endif",
                "",
                "    if {v:currentAction == 'poke'}",
                "        set selectedPromptOption = 4",
                "        set currentEmotion = 'angry'",
                "    endif",
                "",
                "    if {v:hunger > 15}",
                "        set currentEmotion = 'default'",
                "    endif",
                "    if {v:happiness <= 10}",
                "        set currentEmotion = 'sad'",
                "    endif",
                "    if {v:happiness >= 50}",
                "        set currentEmotion = 'happy'",
                "    endif",
                "    if {v:energy <= 20}",
                "        set currentEmotion = 'drowsy'",
                "    endif",
                "    if {v:energy < 10}",
                "        set currentEmotion = 'sleepy'",
                "    endif",
                "    if {v:hunger <= 15}",
                "        set currentEmotion = 'hungry'",
                "    endif",
                "    if {v:hunger < 5}",
                "        set currentEmotion = 'very_hungry'",
                "    endif",
                "",
                "    if {v:currentAction == '[[QUIT]]'}",
                "        out 'Are you sure you want to quit?'",
                "        prompt 0 quitFailsafe no yes",
                "        if {v:quitFailsafe == 'yes'}",
                "            savedata coin",
                "            savedata energy",
                "            savedata hunger",
                "            savedata happiness",
                "            clearterminal",
                "            endprog",
                "        endif",
                "        set quitFailsafe = ''",
                "    endif",
                "",
                "   if {v:energy > 60}",
                "       set energy = 60",
                "   endif",
                "   if {v:energy < 0}",
                "       set energy = 0",
                "   endif",
                "   if {v:hunger > 60}",
                "       set hunger = 60",
                "   endif",
                "   if {v:hunger < 0}",
                "       set hunger = 0",
                "   endif",
                "   if {v:happiness > 60}",
                "       set happiness = 60",
                "   endif",
                "   if {v:happiness < 0}",
                "       set happiness = 0",
                "   endif",
                "   set decayTimer = v:decayTimer + 1",
                "endloop",
                "endprog"
            ] },
        ],
        "D:/Macros": [
            { name: "meow", properties: {transparent: true, read: true, write: true, hidden: false}, data: [
                "ribbit Meow! ^v^",
            ] },
            { name: "create-program", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                "!c",
                "h D:/Programs",
                "ch $1",
                "m $1"
            ] },
            { name: "edit-program", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                "!e",
                "h D:/Programs",
                "m $1"
            ] },
            { name: "reload", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                "!r",
                "[[BULLFROG]]urgentsavestate",
                "[[BULLFROG]]urgentloadstate",
                "[[BULLFROG]]urgentclearstate",
                "clear",
                "ribbit OS state reloaded"
            ] },
            { name: "edit-settings", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                "!es",
                "h Config:",
                "m $1",
            ] },
            { name: "edit-palette", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                "!ep",
                "h D:/Palettes",
                "m $1",
            ] },
            { name: "set-US-time-format", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                "ft w. mn/d/y H:m:s a",
            ] },
        ],
        "D:/Program-Data": [],
        "D:/Palettes": [
            // standard and revised palettes:  https://int10h.org/blog/2022/06/ibm-5153-color-true-cga-palette/
            { name: "standard", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                "000000", // 00 black
                "0000AA", // 01 blue
                "00AA00", // 02 green
                "00AAAA", // 03 cyan
                "AA0000", // 04 red
                "AA00AA", // 05 magenta
                "AA5500", // 06 brown
                "AAAAAA", // 07 light grey
                "555555", // 08 dark grey
                "5555FF", // 09 light blue
                "55FF55", // 10 light green
                "55FFFF", // 11 light cyan
                "FF5555", // 12 light red
                "FF55FF", // 13 light magenta
                "FFFF55", // 14 yellow
                "FFFFFF", // 15 white
            ] },
            { name: "revised", properties: {transparent: true, read: true, write: true, hidden: false}, data: [
                "000000",
                "0000C4",
                "00C400",
                "00C4C4",
                "C40000",
                "C400C4",
                "C47E00",
                "C4C4C4",
                "4E4E4E",
                "4E4EDC",
                "4EDC4E",
                "4EF3F3",
                "DC4E4E",
                "F34EF3",
                "F3F34E",
                "FFFFFF",
            ] },
            { name: "standard-dark", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                "000000", // 00 black (unchanged)
                "000066", // 01 dark blue
                "006600", // 02 dark green
                "006666", // 03 dark cyan
                "660000", // 04 dark red
                "660066", // 05 dark magenta
                "664400", // 06 dark brown
                "666666", // 07 grey
                "222222", // 08 darker grey
                "222288", // 09 deep blue
                "228822", // 10 deep green
                "228888", // 11 deep cyan
                "882222", // 12 deep red
                "882288", // 13 deep magenta
                "888822", // 14 deep yellow
                "AAAAAA", // 15 light grey (less bright than white)
            ] },
            { name: "cherry", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                "000000",
                "1C219F",
                "289E42",
                "17ABAE",
                "E48579",
                "980C6C",
                "BC3517",
                "C2C5C6",
                "464C50",
                "5790E4",
                "FF9F58",
                "68DCCD",
                "831326",
                "D97BC7",
                "B7EA8A",
                "FFFFFF",
            ] },
            { name: "swamp", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                "000000",
                "4B71AF",
                "3F9A44",
                "3B9994",
                "DEA4A5",
                "9A3F95",
                "C27E4B",
                "B2B2B2",
                "6C6C6C",
                "96A2CF",
                "93C495",
                "AECFCD",
                "984547",
                "D7ABD4",
                "D6B87B",
                "FFFFFF",
            ] },
            { name: "swamp-revised", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                "000000",
                "31618D",
                "298B27",
                "268B67",
                "D3977F",
                "773669",
                "BF833A",
                "97A791",
                "465C3F",
                "8DBDD5",
                "81CB7D",
                "91C9B9",
                "753B29",
                "CBA9DB",
                "D7D357",
                "FFFFFF",
            ] },
            { name: "neon", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                "000000",
                "0000FF",
                "00FF00",
                "00FFFF",
                "FF0000",
                "FF00FF",
                "FFA500",
                "ABABAB",
                "757575",
                "5555FF",
                "55FF55",
                "55FFFF",
                "FF5555",
                "FF55FF",
                "FFFF55",
                "FFFFFF",
            ] },
        ],
        "D:/Spinners": [
            { name: "default", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                '-', '\\', '|', '/'
            ] },
            { name: "dots", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                ".", ":", "¨", ":"
            ] },
            { name: "circles", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                ".", "o", "O", "°", "O", "o"
            ] },
            { name: "cross", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                "×", "+"
            ] },
            { name: "wave", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                "~", "–"
            ] },
            { name: "arrows", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                "<", "^", ">", "v"
            ] },
            { name: "shade", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                "·", ":", "!", "+", "x", "%", "#", "%", "x", "+", "!", ":"
            ] }
        ],
    }
}

Object.keys(presetLanguagesMap).forEach((key, i) => {
    // if(i > 8) return;
    // else 
    config.fileSystem["Config:/lang_files"][0].data.push(Object.keys(presetLanguagesMap)[i])
    if(presetLanguagesMap[key].eng != undefined) config.fileSystem["Config:/lang_files"][1].data.push(presetLanguagesMap[key].eng);
    if(presetLanguagesMap[key].nmt != undefined) config.fileSystem["Config:/lang_files"][2].data.push(presetLanguagesMap[key].nmt);
    if(presetLanguagesMap[key].jpn != undefined) config.fileSystem["Config:/lang_files"][3].data.push(presetLanguagesMap[key].jpn);
})