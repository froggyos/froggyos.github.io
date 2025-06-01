// @ts-ignore

const presetLanguagesMap = {
    // general stuff ==========================
    "!LANGNAME: language build helper": {
        eng: "!LANGNAME: English",
        nmt: "!LANGNAME: ngimëte",
        jpn: "!LANGNAME: Japanese",
    },
    "T_froggy_doesnt_like": {
        eng: "Froggy doesn't like that. >:(",
        nmt: "Froggy gehana ilu >:(",
        jpn: "フロッギーはそれが気に入らないよ >:("
    },
    "T_doesnt_know |||[]|||": {
        eng: `Froggy doesn't know "|||[]|||", sorry.`,
        nmt: `Froggy gepele "|||[]|||", mbayu`,
        jpn: "フロッギーは「|||[]|||」がわかりません、ごめんなさい"
    },
    "T_hello_froggy": {
        eng: "Hello, I'm Froggy! ^v^",
        nmt: "i katálo, mo Froggy! ^v^",
        jpn: "どうも、フロッギーです！^v^"
    },
    "T_greeting_1": {
        eng: "Type ‘help’ to receive support with commands, and possibly navigation.",
        nmt: "nenta ‘help’ mbo süm fesúāte kole komandda me, nam giwa 'ata",
        jpn: "コマンドやナビゲーションのサポートを受けるには、「help」と入力してください"
    },
    "T_greeting_2 |||[]|||": {
        eng: "* Welcome to froggyOS, version |||[]||| *",
        nmt: "* wulë froggyOS, kekyene |||[]||| *",
        jpn: "* froggyOSへようこそ！バージョン|||[]||| *"
    },

    // basic command help ====================
    "T_basic_commands_intro": {
        eng: "* A few basic froggyOS commands *",
        nmt: "* tine hatsamwa komandda me o-froggyOS *",
        jpn: "* いくつかの基本的なfroggyOSコマンド *"
    },
    "T_basic_commands_lang": {
        eng: "changelanguage [code]. . . . . . . Changes the current language.",
        nmt: "changelanguage [koda]. . .. . . . . lohi mëzte",
        jpn: "changelanguage [code] . . 現在の言語を変更する"
    },
    "T_basic_commands_palette": {
        eng: "changepalette [palette]. . . . . . Changes the color palette.",
        nmt: "changepalette [paleta] . .. . . . . lohi pesezte paleta",
        jpn: "changepalette [palette] . . カラーパレットを変更する"
    },
    "T_basic_commands_clear": {
        eng: "clear. . . . . . . . . . . . . . . Clears the terminal output.",
        nmt: "clear . . . . . . . . . . . . . . . nggave taminalu tuha",
        jpn: "clear . . 端末の出力をクリアする"
    },
    "T_basic_commands_clone": {
        eng: "clone [file] . . . . . . . . . . . Clones a file.",
        nmt: "clone [fiyala]. . . . . . . . . . . mafo fiyala",
        jpn: "clone [file] . . . . . . . . . ファイルをクローンする"
    },
    "T_basic_commands_clearstate": {
        eng: "clearstate . . . . . . . . . . . . Clears froggyOS state.",
        nmt: "clearstate. . . . . . . . . . . . . ngátiwi satéte o-froggyOS",
        jpn: "clearstate . . froggyOSの状態をクリアする"
    },
    "T_basic_commands_croak": {
        eng: "croak [file] . . . . . . . . . . . Deletes the file.",
        nmt: "croak [fiyala]. . . . . . . . . . . nggave fiyala",
        jpn: "croak [file] . . ファイルを削除する"
    },
    "T_basic_commands_formattime": {
        eng: "formattime [format]. . . . . . . . Changes the time format.",
        nmt: "formattime [folamata] . . . . . . . lohi lohí folamata",
        jpn: "formattime [format] . . 時間形式を変更する"
    },
    "T_basic_commands_hatch": {
        eng: "hatch [file] . . . . . . . . . . . Creates a file.",
        nmt: "hatch [fiyala]. . . . . . . . . . . mbeno fiyala",
        jpn: "hatch [file] . . ファイルを作成する"
    },
    "T_basic_commands_hello": {
        eng: "hello. . . . . . . . . . . . . . . Displays a greeting message.",
        nmt: "hello . . . . . . . . . . . . . . . nenta wüle mem",
        jpn: "hello . . 挨拶のメッセージを表示する"
    },
    "T_basic_commands_help": {
        eng: "help . . . . . . . . . . . . . . . Displays this message.",
        nmt: "help. . . . . . . . . . . . . . . . nenta lu mem",
        jpn: "help . . このメッセージを表示する"
    },
    "T_basic_commands_hop": {
        eng: "hop [directory]. . . . . . . . . . Moves to a directory.",
        nmt: "hop [dilekatüli]. . . . . . . . . . tsi wa dilekatüli",
        jpn: "hop [directory] . . ディレクトリに移動する"
    },
    "T_basic_commands_list": {
        eng: "list . . . . . . . . . . . . . . . Lists files and subdirectories in the :sp35:current directory.",
        nmt: "list. . . . . . . . . . . . . . . . seyaya fiyala me nam dilekatülilala ilo :sp36:dilekatüli wa",
        jpn: "list . . 現在のディレクトリ内のファイルとサブディレクトリを表示する"
    },
    "T_basic_commands_listdrives": {
        eng: "listdrives . . . . . . . . . . . . Lists all drives.",
        nmt: "listdrives. . . . . . . . . . . . . seyaya ká'ono dalayavu me",
        jpn: "listdrives . . 全てのドライブを表示する"
    },
    "T_basic_commands_loadstate": {
        eng: "loadstate. . . . . . . . . . . . . Load froggyOS state.",
        nmt: "loadstate . . . . . . . . . . . . . nagyu satéte o-froggyOS",
        jpn: "loadstate . . froggyOSの状態をロードする"
    },
    "T_basic_commands_meta": {
        eng: "meta [file]. . . . . . . . . . . . Edits a file.",
        nmt: "meta [fiyala] . . . . . . . . . . . lohi fiyala kili'ocyá",
        jpn: "meta [file] . . ファイルを編集する"
    },
    "T_basic_commands_metaprop": {
        eng: "metaprop [file] [property] [0/1] . Edits a file's properties.",
        nmt: "metaprop [fiyala] [popatí] [0/1]. . lohi fiyala oəpopatí me",
        jpn: "metaprop [file] [property] [0/1] . . ファイルのプロパティを変更する"
    },
    "T_basic_commands_opendoc": {
        eng: "opendocumentation. . . . . . . . . Opens the froggyOS documentation.",
        nmt: "opendocumentation . . . . . . . . . ndo dokumenndasiyon o-froggyOS",
        jpn: "opendocumentation . . froggyOSのマニュアルを開く"
    },
    "T_basic_commands_rename": {
        eng: "rename [file] [new_name] . . . . . Renames the file.",
        nmt: "rename [fiyala] [sana_tama] . . . . som'on tama ma fiyala",
        jpn: "rename [file] [new_name] . . . ファイル名を変更する"
    },
    "T_basic_commands_ribbit": {
        eng: "ribbit [text]. . . . . . . . . . . Displays the text.",
        nmt: "ribbit [meməpelezwisi]. . . . . . . nenta meməpelezwisi",
        jpn: "ribbit [テキスト] . . テキストを表示する"
    },
    "T_basic_commands_savestate": {
        eng: "savestate. . . . . . . . . . . . . Save froggyOS state.",
        nmt: "savestate . . . . . . . . . . . . . esaya satéte o-froggyOS",
        jpn: "savestate . . froggyOSの状態をセーブする"
    },
    "T_basic_commands_spawn": {
        eng: "spawn [directory]. . . . . . . . . Creates a directory.",
        nmt: "spawn [dilekatüli]. . . . . . . . . mbeno dilekatüli",
        jpn: "spawn [ディレクトリ] . . ディレクトリを作成する"
    },
    "T_basic_commands_spy": {
        eng: "spy [file] . . . . . . . . . . . . Reads the file and outputs it to the :sp35:terminal.",
        nmt: "spy [fiyala]. . . . . . . . . . . . sensa fiyala nam nenta lu taminalu wa",
        jpn: "spy [ファイル] . . ファイルを読み取る"
    },
    "T_basic_commands_swimto": {
        eng: "swimto [program] . . . . . . . . . Start a program.",
        nmt: "swimto [program]. . . . . . . . . . igyensa pógám",
        jpn: "swimto [プログラム] . . プログラムを開始する"
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
        jpn: "緊急状態が見つかりませんでした"
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
        nmt: `satéte esaya mana. kana "loadstate" ma lohiəte me fene`,
        jpn: "状態をセーブしました。いくつかの変更を適用するには、状態をロードする必要があるかもしれません。"
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
        jpn: "ファイル名と新しいファイル名を入力してください"
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
        jpn: "そのファイル名はこのディレクトリにすでに存在します"
    },
    "T_file_name_not_3_char": {
        eng: "File name must be exactly 3 characters long.",
        nmt: "fiyala tama süm'an u'u 3 gina me kekéne",
        jpn: "ファイル名はちょうど3文字でなければなりません"
    },
    "T_no_permission_to_edit_file": {
        eng: "You do not have permission to edit this file.",
        nmt: "'a gewitsuyo pamason lohi lu fiyala",
        jpn: "このファイルを変更する権限がありません"
    },
    "T_no_permission_to_read_file": {
        eng: "You do not have permission to read this file.",
        nmt: "'a gewitsuyo pamason sanwa lu fiyala",
        jpn: "このファイルを読み取る権限がありません"
    },
    "T_no_permission_to_clone": {
        eng: "You do not have permission to clone this file.",
        nmt: "'a getsefese pamason mafu lu fiyala",
        jpn: "このファイルをクローンする権限がありません"
    },
    "T_no_permission_to_rename_file": {
        eng: "You do not have permission to rename this file.",
        nmt: "'a getsefese pamason som'on tama ma lu fiyala",
        jpn: "このファイル名を変更する権限がありません"
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
        nmt: "* popatí me *",
        jpn: "* 利用可能なプロパティ *"
    },
    "T_file_created": {
        eng: "File created.",
        nmt: "fiyala mbeno mana",
        jpn: "ファイルを作成しました"
    },
    "T_file_cloned |||[]|||": {
        eng: `File "|||[]|||" cloned.`,
        nmt: `fiyala "|||[]|||" mafu mana'a`,
        jpn: "ファイル「|||[]|||」がクローンされました"
    },
    "T_file_renamed": {
        eng: "File renamed.",
        nmt: "fiyala som'on mana'a tama",
        jpn: "ファイル名を変更しました"
    },
    "T_file_deleted": {
        eng: "File deleted.",
        nmt: "fiyala nggave mana'a",
        jpn: "ファイルを削除しました"
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
        nmt: "dilekatüli tsefese",
        jpn: "ディレクトリは既に存在します"
    },
    "T_directory_empty": {
        eng: "This directory is empty.",
        nmt: "ilo wa dilekatüli säna",
        jpn: "このディレクトリは空です"
    },
    "T_cannot_create_directories_in_here": {
        eng: "You cannot create directories in this directory.",
        nmt: "'a gembeno dilekatüli me kene dilekatüli wa",
        jpn: "このディレクトリ内ではディレクトリを作成できません"
    },
    "T_directory_created": {
        eng: "Directory created.",
        nmt: "dilekatüli mbeno mana",
        jpn: "ディレクトリを作成しました"
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
        nmt: "apelelala som apeya pógám",
        jpn: "有効なプログラムを入力してください"
    },
    "T_no_permission_to_run_program": {
        eng: "You do not have permission to run this program.",
        nmt: "'a gewitsuyo pamason naya lu pógám",
        jpn: "このプログラムを実行する権限がありません"
    },
    "T_available_programs": {
        eng: "* Available programs *",
        nmt: "* pógám me *",
        jpn: "* 使用可能なプログラム *"
    },

    // spinner ====================================
    "T_spinner_does_not_exist": {
        eng: "Spinner does not exist.",
        nmt: "supinär getsefese",
        jpn: "スピナーが存在しません"
    },
    "T_available_spinners": {
        eng: "* Available spinners *",
        nmt: "* supinär me *",
        jpn: "* 利用可能なスピナー *"
    },

    // lang =====================================
    "T_provide_lang_code": {
        eng: "Please provide a language code.",
        nmt: "apelelala som mëzte koda",
        jpn: "言語のコードを入力してください"
    },
    "T_lang_does_not_exist |||[]|||": {
        eng: `Language with code "|||[]|||" does not exist.`,
        nmt: `mëzte kole "|||[]|||" getsefese`,
        jpn: "コード「|||[]|||」の言語が存在しません"
    },
    "T_invalid_lang_file |||[]|||": {
        eng: `Invalid language file with code "|||[]|||".`,
        nmt: `sepu mëzte fiyala kole koda "|||[]|||"`,
        jpn: "コード「|||[]|||」の言語ファイルは無効です"
    },
    "T_current_lang_invalid": {
        eng: `Current language file is INVALID! Switching to "lbh".`,
        nmt: `i mewana mëzte fiyala wa SEPE. lohi "lbh"`,
        jpn: `現在の言語ファイルが無効です！「lbh」に切り替えています`
    },
    "T_invalid_lang": {
        eng: "INVALID",
        nmt: "SEPU",
        jpn: "無効"
    },
    "T_available_langs": {
        eng: "* Available languages *",
        nmt: "* mëzte me *",
        jpn: "* 利用可能な言語 *"
    },
    "T_lang_changed": {
        eng: "Language changed.",
        nmt: "mëzte lohi mana",
        jpn: "言語が変更されました"
    },

    /// miscellaneous provide ... ====================================
    "T_provide_valid_property_type": {
        eng: "Please provide a valid property type.",
        nmt: "apelelala som apeya popatí",
        jpn: "有効なプロパティタイプを入力してください"
    },
    "T_provide_text_to_display": {
        eng: "Please provide text to display.",
        nmt: "apelelala som meməpelezwisi nenta",
        jpn: "表示するテキストを入力してください"
    },
    "T_provide_path": {
        eng: "Please provide a path.",
        nmt: "apelelala som fiyalātáne",
        jpn: "パスを入力してください"
    },
    "T_invalid_args_provide_1_0": {
        eng: "Invalid argument. Please provide '1' or '0'.",
        nmt: "sepu ágayuménta. apelelala som '1' ute '0'",
        jpn: "無効な引数です。「1」または「0」を入力してください。"
    },
    "T_provide_program_name_and_line": {
        eng: "Please provide a program name and a line number.",
        nmt: "T_provide_program_name_and_line",
        jpn: "T_provide_program_name_and_line"
    },

    // lilypad ====================================
    "T_lilypad_save_exit": {
        eng: "* press ESC to save and exit lilypad *",
        nmt: "* tapa ESC esaya mótsi lo lilypad *",
        jpn: "* セーブしてlilypadを終了するにはESCキーを押してください *"
    },
    "T_lilypad_exit": {
        eng: "* press ESC to exit lilypad *",
        nmt: "* tapa ESC mótsi lilypad *",
        jpn: "* lilypadを終了するにはESCキーを押してください *"
    },
    "T_lilypad_exit_without_saving": {
        eng: "Exited lilypad without saving.",
        nmt: "T_lilypad_exit_without_saving",
        jpn: "T_lilypad_exit_without_saving"
    },
    "T_saving_file": {
        eng: "Saving file...",
        nmt: "esaya gya fiyala...",
        jpn: "ファイルをセーブ中..."
    },
    "T_saving_done": {
        eng: "Done! ^v^",
        nmt: "i sepesu! ^v^",
        jpn: "完了！^v^"
    },

    // misc success =========================
    "T_properties_updated": {
        eng: "Properties updated.",
        nmt: "popatí me som'on mana",
        jpn: "プロパティを更新しました"
    },
    "T_documentation_opened": {
        eng: "Documentation opened in a new window.",
        nmt: "dokumenndasiyon ndo mana sana kyesatsa wa",
        jpn: "新しいウインドウでマニュアルが開かれました"
    },

    // misc error/fail =========================
    "T_arg_too_long": {
        eng: "The argument is too long.",
        nmt: "ágayuménta na'ë kékene",
        jpn: "引数が長すぎます"
    },
    "T_missing_file_args": {
        eng: "Missing file argument(s).",
        nmt: "ndaní fiyala ágayuménta me",
        jpn: "ファイルの引数が不足しています"
    },
    "T_UNUSED_invalid_format_object_inter_rule_delimiter": {
        eng: "Invalid FormatObject (INTER-RULE DELIMITER) syntax.",
        nmt: "gogowa FormatObject (LU GAYANA MEMƏPELEWISI) sebesikya",
        jpn: "無効なフォーマットオブジェクト（インター・ルール・デリミター）構文です"
    },
    "T_UNUSED_error_data_unavailable": {
        eng: "Error Data UNAVAILABLE",
        nmt: "gogowa data UNAYAVA",
        jpn: "エラーデータは利用できません"
    },
    "T_provide_valid_t_desc": {
        eng: "Please provide a valid translation descriptor.",
        nmt: "apelelala som apeya mëmëzte dësikipita",
        jpn: "有効な翻訳ディスクリプターを入力してください"
    },

    // bullfrog commands =========================
    "T_bullfrog_commands_intro": {
        eng: "* A few bullfrog commands *",
        nmt: "* tine bullfrog komandda me o-froggyOS *",
        jpn: "* いくつかのbullfrogコマンド *"
    },
    "T_bullfrog_commands_changepath": {
        eng: "[[BULLFROG]]changepath [path] - Changes the path of the terminal",
        nmt: "[[BULLFROG]]changepath [fiyalātáne] - lohi fiyalātáne oətaminalu",
        jpn: "[[BULLFROG]]changepath [path] - 端末のパスを変更する"
    },
    "T_bullfrog_commands_greeting": {
        eng: "[[BULLFROG]]greeting - Displays the greeting message",
        nmt: "[[BULLFROG]]greeting - nenta náha wulë mem",
        jpn: "[[BULLFROG]]greeting - 挨拶のメッセージを表示する"
    },
    "T_bullfrog_commands_help": {
        eng: "[[BULLFROG]]help - Displays this message",
        nmt: "[[BULLFROG]]help - nenta lu mem",
        jpn: "[[BULLFROG]]help - このメッセージを表示する"
    },
    "T_bullfrog_commands_setstatbar": {
        eng: "[[BULLFROG]]setstatbar [text] - Changes the text in the status bar",
        nmt: "[[BULLFROG]]setstatbar [meməpelezwisi] - lohi meməpelezwisi status-bar wa",
        jpn: "[[BULLFROG]]setstatbar [text] - ステータスバーのテキストを変更する"
    },
    "T_bullfrog_commands_statbarlock": {
        eng: "[[BULLFROG]]statbarlock [0/1] - Locks the status bar from updating",
        nmt: "[[BULLFROG]]statbarlock [0/1] - bíhu'an status-bar ëpidäti",
        jpn: "[[BULLFROG]]statbarlock [0/1] - ステータスバーの更新をロックする"
    },
    "T_bullfrog_commands_showspinner": {
        eng: "[[BULLFROG]]showspinner [0/1] - Toggles the loading spinner",
        nmt: "[[BULLFROG]]showspinner [0/1] - togela supinär",
        jpn: "[[BULLFROG]]showspinner [0/1] - ローディングスピナーの表示を切り替える"
    },
    "T_bullfrog_commands_debugmode": {
        eng: "[[BULLFROG]]debugmode [0/1] - Toggles debug mode",
        nmt: "[[BULLFROG]]debugmode [0/1] - togela debug módi",
        jpn: "[[BULLFROG]]debugmode [0/1] - デバッグモードを切り替える"
    },
    "T_bullfrog_commands_setspinner": {
        eng: "[[BULLFROG]]setspinner [spinner] - Changes the loading spinner",
        nmt: "[[BULLFROG]]setspinner [supinär] - lohi supinär",
        jpn: "[[BULLFROG]]setspinner [spinner] - ローディングスピナーを変更する"
    },
    "T_bullfrog_commands_usavestate": {
        eng: "[[BULLFROG]]urgentsavestate - saves state for reloading",
        nmt: "[[BULLFROG]]urgentsavestate - esaya satéte ma nagyunagyu",
        jpn: "[[BULLFROG]]urgentsavestate - リロードするには状態をセーブする"
    },
    "T_bullfrog_commands_uloadstate": {
        eng: "[[BULLFROG]]urgentloadstate - loads state for reloading",
        nmt: "[[BULLFROG]]urgentloadstate - nagyu satéte ma nagyunagyu",
        jpn: "[[BULLFROG]]urgentloadstate - リロードするには状態をセーブする"
    },
    "T_bullfrog_commands_uclearstate": {
        eng: "[[BULLFROG]]urgentclearstate - clears reload state",
        nmt: "[[BULLFROG]]urgentclearstate - ngátiwi nagyunagyu satéte",
        jpn: "[[BULLFROG]]urgentclearstate - リロードの状態をクリアする"
    },
    "T_bullfrog_commands_autoloadstate": {
        eng: "[[BULLFROG]]autoloadstate - loads state",
        nmt: "[[BULLFROG]]autoloadstate - nagyu satéte",
        jpn: "[[BULLFROG]]autoloadstate - 状態をロードする"
    },
    "T_bullfrog_commands_vlang": {
        eng: "[[BULLFROG]]validatelanguage - checks if the current language is valid",
        nmt: "[[BULLFROG]]validatelanguage - nehu kansa mweana mëzta wa sepe",
        jpn: "[[BULLFROG]]validatelanguage - 現在の言語は有効か無効か確認する"
    },
    "T_bullfrog_commands_translations": {
        eng: "[[BULLFROG]]translations - get the completion percent of all languages",
        nmt: "[[BULLFROG]]translations - süm mëmëzte me",
        jpn: "[[BULLFROG]]translations - すべての言語の完了率を表示する"
    },
    "T_bullfrog_commands_trigdiag": {
        eng: "[[BULLFROG]]triggerdialogue - trigger a specific dialogue option",
        nmt: "[[BULLFROG]]triggerdialogue - bene náha meməpelezwisi ndisé",
        jpn: "[[[BULLFROG]]triggerdialogue - 特定の対話を開始する",
    },

    // date and time =========================
    "T_date_short_sunday": {
        eng: "Sun",
        nmt: "ypg",
        jpn: "日"
    },
    "T_date_short_monday": {
        eng: "Mon",
        nmt: "ypl",
        jpn: "月"
    },
    "T_date_short_tuesday": {
        eng: "Tue",
        nmt: "ypb",
        jpn: "火"
    },
    "T_date_short_wednesday": {
        eng: "Wed",
        nmt: "yps",
        jpn: "水"
    },
    "T_date_short_thursday": {
        eng: "Thu",
        nmt: "ypk",
        jpn: "木"
    },
    "T_date_short_friday": {
        eng: "Fri",
        nmt: "ypm",
        jpn: "金"
    },
    "T_date_short_saturday": {
        eng: "Sat",
        nmt: "ypw",
        jpn: "土"
    },
    "T_date_long_sunday": {
        eng: "Sunday",
        nmt: "yepë-gela",
        jpn: "日曜日"
    },
    "T_date_long_monday": {
        eng: "Monday",
        nmt: "yepë-la",
        jpn: "月曜日"
    },
    "T_date_long_tuesday": {
        eng: "Tuesday",
        nmt: "yepë-bese",
        jpn: "火曜日"
    },
    "T_date_long_wednesday": {
        eng: "Wednesday",
        nmt: "yepë-sála",
        jpn: "水曜日"
    },
    "T_date_long_thursday": {
        eng: "Thursday",
        nmt: "yepë-kimi",
        jpn: "木曜日"
    },
    "T_date_long_friday": {
        eng: "Friday",
        nmt: "yepë-molo",
        jpn: "金曜日"
    },
    "T_date_long_saturday": {
        eng: "Saturday",
        nmt: "yepë-wé",
        jpn: "土曜日"
    },
    "T_date_short_january": {
        eng: "Jan",
        nmt: "ygl",
        jpn: "1月"
    },
    "T_date_short_february": {
        eng: "Feb",
        nmt: "yla",
        jpn: "2月"
    },
    "T_date_short_march": {
        eng: "Mar",
        nmt: "ybs",
        jpn: "3月"
    },
    "T_date_short_april": {
        eng: "Apr",
        nmt: "ysl",
        jpn: "4月"
    },
    "T_date_short_may": {
        eng: "May",
        nmt: "ykm",
        jpn: "5月"
    },
    "T_date_short_june": {
        eng: "Jun",
        nmt: "yml",
        jpn: "6月"
    },
    "T_date_short_july": {
        eng: "Jul",
        nmt: "ywé",
        jpn: "7月"
    },
    "T_date_short_august": {
        eng: "Aug",
        nmt: "yan",
        jpn: "8月"
    },
    "T_date_short_september": {
        eng: "Sep",
        nmt: "ymk",
        jpn: "9月"
    },
    "T_date_short_october": {
        eng: "Oct",
        nmt: "ykó",
        jpn: "10月"
    },
    "T_date_short_november": {
        eng: "Nov",
        nmt: "ykg",
        jpn: "11月"
    },
    "T_date_short_december": {
        eng: "Dec",
        nmt: "ykl",
        jpn: "12月"
    },
    "T_date_long_january": {
        eng: "January",
        nmt: "yepëlili-gela",
        jpn: "一月"
    },
    "T_date_long_february": {
        eng: "February",
        nmt: "yepëlili-la",
        jpn: "二月"
    },
    "T_date_long_march": {
        eng: "March",
        nmt: "yepëlili-bese",
        jpn: "三月"
    },
    "T_date_long_april": {
        eng: "April",
        nmt: "yepëlili-sála",
        jpn: "四月"
    },
    "T_date_long_may": {
        eng: "May",
        nmt: "yepëlili-kimi",
        jpn: "五月"
    },
    "T_date_long_june": {
        eng: "June",
        nmt: "yepëlili-molo",
        jpn: "六月"
    },
    "T_date_long_july": {
        eng: "July",
        nmt: "yepëlili-wé",
        jpn: "七月"
    },
    "T_date_long_august": {
        eng: "August",
        nmt: "yepëlili-ana",
        jpn: "八月"
    },
    "T_date_long_september": {
        eng: "September",
        nmt: "yepëlili-miki",
        jpn: "九月"
    },
    "T_date_long_october": {
        eng: "October",
        nmt: "yepëlili-kó",
        jpn: "十月"
    },
    "T_date_long_november": {
        eng: "November",
        nmt: "yepëlili-kó-nam-gela",
        jpn: "十一月"
    },
    "T_date_long_december": {
        eng: "December",
        nmt: "yepëlili-kó-nam-la",
        jpn: "十二月"
    },

    // uncategorized messages ==========================

};

class UserKey { constructor() {} };

function killAndOutputError(message) {
    Interpreter.interpreters.main.kill();
    throw new Error(message);
}

class fs {
    #fs;
    #functionHashes = ['d3396c0bd3fbee7b', 'db27f8a3fb2ffdeb', '1bd973c83ffd73fa', '82d4b690dbd7fed8', '2dd95c38effddd7d', 'a50c94d5ed5cb6d7', '3c5121f5fe5dfbf5', 'a3dfd1f1f3ffd7fd', 'df38f27fdf39f77f', 'eb126488fb1ff488', 'c8908b36fc9dfbb7', '265c76422eff7e7a']
    #keywordHashes = []
    #methodHashes = []

    #cache = new Map();

    hash(inp) {
        function F(v,k){const Q=X();return F=function(x,E){x=x-(0xc44+0x3a2*-0x2+-0x3a7);let o=Q[x];return o;},F(v,k);}(function(k,Q){function S(k,Q,x,E,o){return F(o- -0x173,k);}function C(k,Q,x,E,o){return F(o-0x364,E);}function L(k,Q,x,E,o){return F(k-0x28b,E);}function M(k,Q,x,E,o){return F(k- -0xb5,E);}const x=k();function Y(k,Q,x,E,o){return F(E- -0x3e,x);}while(!![]){try{const E=parseInt(S(-0x11,-0x19,-0xb,-0x4,-0xf))/(-0xe*0xa2+-0x813+0x10f0)*(-parseInt(S(-0x1a,-0xe,-0x1d,-0x13,-0x1a))/(0x5*-0x64f+-0x1747+0x3a*0xf2))+parseInt(L(0x3ea,0x3e4,0x3e7,0x3dd,0x3e0))/(-0x1*0x1283+-0x1672+0x28f8)*(-parseInt(L(0x3e5,0x3e0,0x3e2,0x3dd,0x3f1))/(-0x4*-0x5e6+0x1f*-0x9d+-0x491))+parseInt(C(0x4de,0x4c9,0x4c8,0x4cf,0x4d4))/(-0x65d+-0xc56*-0x3+-0x1ea0)*(parseInt(L(0x3f9,0x3ff,0x404,0x3fc,0x3ff))/(0x125*-0x19+0x3*-0x2d7+0x2528))+parseInt(L(0x3fa,0x406,0x3f1,0x407,0x406))/(0xe49+-0x93b*-0x1+0x7*-0x35b)*(parseInt(L(0x3f8,0x3ec,0x400,0x3fc,0x3ed))/(0xa42+-0x10b5+0x67b))+parseInt(L(0x3fc,0x3f6,0x406,0x3ee,0x3f1))/(-0x2584+0x48b+-0x2102*-0x1)+parseInt(Y(0x135,0x131,0x134,0x129,0x11f))/(0x5ef+0x1*0x154f+-0x1b34)+-parseInt(C(0x4ce,0x4cb,0x4c7,0x4da,0x4cc))/(-0x1f*0x137+0x1099*0x1+-0x3*-0x709);if(E===Q)break;else x['push'](x['shift']());}catch(o){x['push'](x['shift']());}}}(X,0xd*0x66a3+0x66c88+0x4e95b*-0x1));let v=()=>{const k={'\x6e\x6c\x4e\x6d\x4b':function(U,g,u){return U(g,u);},'\x6e\x75\x62\x53\x62':function(U,g){return U(g);},'\x6d\x63\x41\x55\x42':function(U,g,u){return U(g,u);},'\x66\x54\x42\x50\x68':function(U,g){return U(g);},'\x44\x46\x6d\x48\x76':function(U,g){return U>>>g;},'\x6a\x49\x6f\x76\x65':function(U,g){return U+g;},'\x44\x70\x4d\x4a\x56':function(U,g){return U^g;},'\x75\x6d\x46\x61\x6b':function(U,g){return U&g;},'\x69\x74\x6a\x75\x69':function(U,g){return U+g;}},Q=U=>U[d(0x255,0x24a,0x260,0x255,0x254)+'\x63\x65'](/\/\/.*$/gm,'')[d(0x255,0x262,0x24f,0x248,0x25c)+'\x63\x65'](/\/\*[\s\S]*?\*\//g,'')[B(0x25a,0x262,0x26b,0x268,0x26c)+'\x63\x65'](/\s+/g,'\x20')[a(0x87,0x92,0x81,0x87,0x87)+'\x63\x65'](/\s*([{}();,:=+\-*/<>])\s*/g,'\x24\x31')[a(0x8e,0x88,0x9d,0x9c,0x90)](),x=k[a(0xa8,0x92,0x93,0xa6,0x9d)](murmurhash3_32_gc,k[a(0x82,0x85,0x96,0x96,0x8d)](Q,inp),inp[J(-0x19e,-0x197,-0x19a,-0x1a8,-0x19c)+'\x68']);function B(k,Q,x,E,o){return F(E-0x10b,Q);}const E=k[B(0x270,0x26f,0x26c,0x276,0x278)](murmurhash3_32_gc,k[B(0x266,0x282,0x26e,0x274,0x267)](Q,inp)[a(0x8f,0x8d,0x84,0x87,0x8c)]('')[J(-0x19d,-0x1a8,-0x1a9,-0x19d,-0x1a9)+'\x73\x65']()[d(0x256,0x25f,0x24d,0x24a,0x261)](''),inp[a(0xa5,0x94,0x95,0xaa,0x9c)+'\x68']);function b(k,Q,x,E,o){return F(x- -0x21d,Q);}function d(k,Q,x,E,o){return F(k-0xf8,E);}function a(k,Q,x,E,o){return F(o- -0xd6,Q);}function J(k,Q,x,E,o){return F(o- -0x30e,Q);}const o=k[J(-0x1a5,-0x1b3,-0x1ab,-0x1b8,-0x1ae)](k[d(0x26c,0x273,0x263,0x271,0x272)](k[J(-0x1bb,-0x1b7,-0x1b6,-0x1b2,-0x1b3)](x,E),k[a(0x99,0x89,0x97,0x9c,0x96)](x,E)),-0x100*0x8+0x1d*0x14c+-0x1d9c);return k[d(0x254,0x260,0x24c,0x24f,0x25b)](x[d(0x259,0x264,0x250,0x25c,0x24c)+b(-0xbf,-0xb6,-0xb3,-0xbe,-0xbf)](-0x25cf*-0x1+0x1ea3+-0x4462),o[b(-0xc2,-0xc6,-0xbc,-0xb7,-0xc8)+a(0x9c,0x9c,0x9b,0xa1,0x94)](0x1*0x78b+0x15f7+-0x1d72));};function X(){const j=['\x33\x30\x48\x76\x45\x54\x72\x47','\x39\x35\x39\x73\x56\x4b\x72\x74\x4c','\x32\x36\x32\x32\x36\x35\x63\x79\x4b\x79\x72\x56','\x31\x37\x38\x35\x32\x34\x30\x46\x49\x73\x77\x6a\x42','\x6c\x65\x6e\x67\x74','\x6e\x6c\x4e\x6d\x4b','\x6a\x49\x6f\x76\x65','\x31\x32\x32\x31\x30\x36\x32\x55\x77\x79\x66\x53\x43','\x32\x33\x30\x38\x70\x5a\x5a\x51\x76\x56','\x44\x70\x4d\x4a\x56','\x69\x74\x6a\x75\x69','\x72\x65\x70\x6c\x61','\x6a\x6f\x69\x6e','\x31\x30\x37\x34\x61\x5a\x6c\x73\x69\x4b','\x44\x46\x6d\x48\x76','\x74\x6f\x53\x74\x72','\x73\x70\x6c\x69\x74','\x6e\x75\x62\x53\x62','\x31\x6c\x43\x4b\x54\x71\x50','\x72\x65\x76\x65\x72','\x74\x72\x69\x6d','\x37\x39\x35\x30\x31\x35\x30\x6e\x43\x54\x48\x55\x41','\x36\x36\x37\x37\x39\x39\x30\x4f\x4d\x62\x48\x4d\x58','\x66\x54\x42\x50\x68','\x69\x6e\x67','\x6d\x63\x41\x55\x42','\x75\x6d\x46\x61\x6b','\x33\x35\x35\x37\x36\x50\x4c\x5a\x73\x48\x73'];X=function(){return j;};return X();};return v();
    }

    constructor(data) {
        for(let directoryName in data){
            let dir = data[directoryName];
            dir.forEach((file, i) => {
                data[directoryName][i] = new FroggyFile(file.name, file.properties, file.data);
            })
        }

        this.#fs = data
    }

    verifyMethod(method) {
        let stack = new Error().stack.split("\n");
        if(!stack[2].trim().startsWith("at Method.ffsProxy")) throw new Error(`You may not use verifyMethod() directly. You must use method.ffsProxy() instead.`); 
        let id = method.getId();

        if (!this.#methodHashes.includes(id)) throw new Error(`Access denied: Method "${method.name}" is not allowed to access the file system.`);
        return this;
    }

    #verify() {
        let stack = new Error().stack.split("\n");
        const caller = stack[stack.length - 2].trim().split(" ")[1];

        if(caller == "Interpreter.gotoNext"){
            // keyword verification
            const tokens = structuredClone(Interpreter.interpreters.main.tokens);
            const tokenName = tokens[tokens.length - 1][0].value;

            let keyword = Keyword.schemes[tokenName];

            let id = keyword.getId();

            if (!this.#keywordHashes.includes(id)) throw new Error(`Access denied: Keyword "${tokenName}" is not allowed to access the file system.`);
        } else {
            // function verification
            // if any index of the stack has <anonymous> in it, it means the function is anonymous and we should not allow file system access
            if (stack.some(line => line.includes("at <anonymous>"))) throw new Error(`HAHA! NICE TRY! No.`);
            if(eval(caller) === undefined && caller.startsWith("fs.")) return;

            try { eval(caller) } catch (e) { throw new Error(`Access denied: You may not access the file system through an anonymous arrow function.`) }

            if(eval(caller) == undefined) throw new Error(`Access denied: You may not access the file system through an anonymous arrow function.`);

            const callerHash = this.#cache.get(eval(caller).toString()) || this.hash(eval(caller).toString());

            if(this.#cache.get(eval(caller).toString()) === undefined) this.#cache.set(eval(caller).toString(), callerHash);

            if (!this.#functionHashes.includes(callerHash)) throw new Error(`Access denied: JavaScript Function "${caller}" is not allowed to access the file system.`);
        }
    }

    getDirectory(fullPath) {
        this.#verify();
        const fs = this.#fs;

        return fs[fullPath]?.filter(f => f.getProperty("hidden") !== true) || undefined;
    }

    getFile(fullPath) {
        this.#verify();

        let fp = fullPath.split("/");
        let path = fp.slice(0, -1).join("/");
        let file = fp[fp.length - 1];
        const fs = this.#fs;

        let retrievedFile = fs[path]?.find(f => f.getName() === file);
        if(retrievedFile === undefined) return undefined;
        if(retrievedFile.getProperty("hidden") === true) return undefined;
        return retrievedFile;
    }

    addFileToDirectory(fullPath, file) {
        this.#verify();
        const fs = this.#fs;

        if(fs[fullPath] === undefined) return undefined;
        if(fs[fullPath]?.find(f => f.getName() === file.getName())) return undefined;
        this.#fs[fullPath].push(file);
    }

    getRoot() {
        this.#verify();
        return this.#fs;
    }

    deleteFile(fullPath) {
        this.#verify();
        let fp = fullPath.split("/");
        let path = fp.slice(0, -1).join("/");
        let file = fp[fp.length - 1];
        const fs = this.#fs;

        if(fs[path] === undefined) return undefined;

        let index = fs[path]?.findIndex(f => f.getName() === file);
        if(index === -1 || index == undefined) return undefined;

        fs[path].splice(index, 1);
    }

    createDirectory(location) {
        this.#verify();
        if(this.#fs[location] !== undefined) return undefined;

        this.#fs[location] = [];
    }

    stringify() {
        this.#verify();
        let strippedObject = {};
        for (let directory in this.#fs) {
            strippedObject[directory] = this.#fs[directory].map(file => {
                return {
                    name: file.getName(),
                    properties: file.getProperties(),
                    data: file.getData()
                };
            });
        }

        return JSON.stringify(strippedObject);
    }

    loadFromString(data, method = null) {
        this.#verify(method);
        try {
            let parsedData = JSON.parse(data);
            for (let directory in parsedData) {
                if (!this.#fs[directory]) {
                    this.#fs[directory] = [];
                }
                parsedData[directory].forEach(file => {
                    let newFile = new FroggyFile(file.name, file.properties, file.data);
                    this.addFileToDirectory(directory, newFile);
                });
            }
        } catch (e) {
            throw new Error("Invalid data format: " + e.message);
        }
    }

}

class FroggyFile {
    #name
    #properties
    #data
    static filePropertyDefaults = {
        transparent: false,
        read: true,
        write: true,
        hidden: false
    }
    constructor(name, properties = FroggyFile.filePropertyDefaults, data = [""]) {
        this.#name = name;
        this.#properties = properties;
        this.#data = data;
    }


    rename(newName){
        this.#name = newName;
    }

    write(data) {
        this.#data = data;
    }

    getData() {
        return this.#data;
    }

    getName() {
        return this.#name;
    }

    getProperties() {
        return this.#properties;
    }

    getProperty(name) {
        return this.#properties[name];
    }

    setProperty(name, value) {
        if (this.#properties[name] !== undefined) {
            this.#properties[name] = value;
        } else return undefined;
    }
}


const FroggyFileSystem = new fs({
    "Config:": [
        { name: "trusted_files", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "test",
        ] },
        { name: "user", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "KEY language TYPE String VALUE eng END",
            "KEY debugMode TYPE Boolean VALUE false END",
            "KEY colorPalette TYPE String VALUE standard END",
            "KEY version TYPE String VALUE 1.15-indev END",
            "KEY showSpinner TYPE Boolean VALUE false END",
            "KEY currentSpinner TYPE String VALUE default END",
            "KEY defaultSpinner TYPE String VALUE default END",
            "KEY timeFormat TYPE String VALUE w. y/mn/d h:m:s END",
            "KEY updateStatBar TYPE Boolean VALUE true END",
            "KEY allowedProgramDirectories TYPE Array START",
            "0 TYPE String VALUE D:/Programs",
            "KEY allowedProgramDirectories TYPE Array END",
            "KEY dissallowSubdirectoriesIn TYPE Array START",
            "0 TYPE String VALUE D:/Programs",
            "1 TYPE String VALUE D:/Macros",
            "2 TYPE String VALUE D:/Program-Data",
            "3 TYPE String VALUE D:/Palettes",
            "4 TYPE String VALUE D:/Spinners",
            "KEY dissallowSubdirectoriesIn TYPE Array END",
            "KEY validateLanguageOnStartup TYPE Boolean VALUE true END",
        ] },
    ],
    "Config:/langs": [
        { name: "lbh", properties: {transparent: true, read: true, write: false, hidden: false}, data: [] },
        { name: "eng", properties: {transparent: false, read: true, write: true, hidden: false}, data: [] },
        { name: "nmt", properties: {transparent: false, read: true, write: true, hidden: false}, data: [] },
        { name: "jpn", properties: {transparent: false, read: true, write: true, hidden: false}, data: [] },
    ],
    "Config:/program_data": [
        { name: "test", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "KEY meow!! TYPE Array START",
            "0 TYPE String VALUE Meow!",
            "1 TYPE String VALUE Ribbit!",
            "2 TYPE Number VALUE 7.201",
            "KEY meow!! TYPE Array END",
            "KEY Ribbit TYPE String VALUE woof END",
            "KEY shit TYPE Number VALUE 1.2 END"
        ] },
    ],  "C:": [],
    "C:/Home": [
        { name: "welcome!", properties: {transparent: false, read: true, write: true, hidden: false}, data: ['Hello!', "Welcome to FroggyOS.", "Type 'help' for a list of commands.", "Have fun! ^v^"] },
    ],
    "C:/Docs": [],
    "D:": [], 
    "D:/Programs": [
        { name: "cli", properties: {transparent: false, read: false, write: false, hidden: true}, data: ["str cli = 'this program is hardcoded into froggyOS'", "endprog"] },
        { name: "lilypad", properties: {transparent: false, read: false, write: false, hidden: true}, data: ["str lilypad = 'this program is hardcoded into froggyOS'", "endprog"] },
        { name: "kaerugotchi", properties: {transparent: false, read:true, write: true, hidden: false}, data: [
            "func display_frog(head:S)",
                "if head>eq('default')",
                    "out '  o..o'",
                "endif",
                "if head>eq('drowsy')",
                    "out '  =..='",
                "endif",
                "if head>eq('sleepy')",
                    "out '  _.._ .zZ'",
                "endif",
                "if head>eq('happy')",
                    "out '  ^..^'",
                "endif",
                "if head>eq('confused')",
                    "out '  @..@'",
                "endif",
                "if head>eq('angry')",
                    "out '  >..<'",
                "endif",
                "if head>eq('sad')",
                    "out '  q..q'",
                "endif",
                "if head>eq('unamused')",
                    "out '  -..-'",
                "endif",
                "out ' (----)'",
                "out '(>____<)'",
                "out ' ^^~~^^'",
            "endfunc",
            "call @display_frog('sleepy')",
        ] },
        { name: "test", properties: {transparent: true, read: true, write: true, hidden: false}, data: [
            "import 'graphics'",
            "import 'config'",
            "createscreen 79,58",
            "line line1 = $0, 10, 10, 0$",
            "line line2 = $0, 0, 10, 10$",
            "text text1 = $5, 5, 'Hello World!'$",
            ".text1>add",
            ".line1>add",
            ".line2>add",
            "pxl pixel = $5, 5$",
            "pxl intersect = line1>intersection(line2)",
            "out intersect>toString",
            "out intersect>back",
            "out intersect>front",
            "out intersect>value",
            "out ''",
            "out EmptyLine",
            "out 'meow'",
            "out 1>inc",
        

            // "str name = ''",
            // "num age = 0",
            // 'filearg %name',
            // 'filearg %age',
            // 'out "Hello my name is $|name| and I am $|age| years old."',
            // "out 10",
            // "out false",
            // "out 'meow!'"

        ] },
        { name: "test2", properties: {transparent: true, read: true, write: true, hidden: false}, data: [
            "arr meow = $4, 48$",
            'outf "t=c01,i=1" , "this is blue text"',
            'outf "b=c00" , "this is a black background"',
            'outf "t=c06, b=c01" , "this is brown text on a blue background"',
            'outf "t=c01, tr=0-21" , "from char 0 to char 21, the text will be blue" ',
            'outf "t=c01, tr=meow>index(0)-meow>index(1) | b=c04, br=57-91" , "from the char 4 to char 48, the text will be blue. AND from char 57 to char 91 the background will be red" ',
            "clearterminal",
        ] },
        { name: "fibonacci", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "num i = 0",
            "num amount = 0",
            "num nOne = 0",
            "num nTwo = 1",
            "num sum = 0",
            "out 'How many fibonacci numbers do you want to generate?'",
            "ask %amount , '?'",
            "loop {i < amount}",
            "<%i>inc",
            "set sum = {nOne + nTwo}",
            "out '#$|i|: $|sum|'",
            "set nTwo = nOne",
            "set nOne = sum",
            "endloop",
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
            "ribbit OS state reloaded",
            "[[BULLFROG]]changepath C:/Home"
        ] },
        { name: "edit-settings", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "!es",
            "h Config:",
            "m user",
        ] },
        { name: "edit-palette", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "!ep",
            "h D:/Palettes",
            "m $1",
        ] },
        { name: "debug", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "!d",
            "[[BULLFROG]]debugmode 1",
        ] },
        { name: "set-US-time-format", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "ft w. mn/d/y H:m:s a",
        ] },
    ],
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
            "void-space 00",
            "bar-background 01",
            "bar-text 15",
            "terminal-background 15",
            "terminal-line-background 15",
            "terminal-line-highlighted-background 14",
            "terminal-line-text 02",
            "terminal-line-selection-background 02",
            "terminal-line-selection-text 15",
            "error-background 12",
            "translation-error-backgroud 05",
            "translation-warning-backgroud 06",
            "program-error-background 04",
            "alert-background 03",
            "error-text 15",
            "prompt-selected-background 02",
            "prompt-selected-text 15",
            "froggyscript-number-color 09",
            "froggyscript-boolean-color 09",
            "froggyscript-string-color 02",
        ] },
        { name: "revised", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
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
            "void-space 00",
            "bar-background 01",
            "bar-text 15",
            "terminal-background 15",
            "terminal-line-background 15",
            "terminal-line-highlighted-background 14",
            "terminal-line-text 02",
            "terminal-line-selection-background 02",
            "terminal-line-selection-text 15",
            "error-background 12",
            "translation-error-backgroud 05",
            "translation-warning-backgroud 06",
            "program-error-background 04",
            "alert-background 03",
            "error-text 15",
            "prompt-selected-background 02",
            "prompt-selected-text 15",
            "froggyscript-number-color 09",
            "froggyscript-boolean-color 09",
            "froggyscript-string-color 02",
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
            "void-space 00",
            "bar-background 01",
            "bar-text 15",
            "terminal-background 15",
            "terminal-line-background 15",
            "terminal-line-highlighted-background 14",
            "terminal-line-text 02",
            "terminal-line-selection-background 02",
            "terminal-line-selection-text 15",
            "error-background 12",
            "translation-error-backgroud 05",
            "translation-warning-backgroud 06",
            "program-error-background 04",
            "alert-background 03",
            "error-text 15",
            "prompt-selected-background 02",
            "prompt-selected-text 15",
            "froggyscript-number-color 09",
            "froggyscript-boolean-color 09",
            "froggyscript-string-color 02",
        ] },
        { name: "cherry", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "000000", 
            "1C219F", 
            "289E42", 
            "17ABAE", 
            "831326", 
            "980C6C", 
            "BC3517", 
            "C2C5C6", 
            "464C50", 
            "5790E4", 
            "B7EA8A", 
            "68DCCD", 
            "E48579", 
            "D97BC7", 
            "FF9F58", 
            "FFFFFF", 
            "void-space 00",
            "bar-background 01",
            "bar-text 15",
            "terminal-background 15",
            "terminal-line-background 15",
            "terminal-line-highlighted-background 10",
            "terminal-line-text 02",
            "terminal-line-selection-background 02",
            "terminal-line-selection-text 15",
            "error-background 12",
            "translation-error-backgroud 05",
            "translation-warning-backgroud 06",
            "program-error-background 04",
            "alert-background 03",
            "error-text 15",
            "prompt-selected-background 02",
            "prompt-selected-text 15",
            "froggyscript-number-color 09",
            "froggyscript-boolean-color 09",
            "froggyscript-string-color 02",
        ] },
        { name: "swamp", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "000000",
            "4B71AF",
            "3F9A44",
            "3B9994",
            "984547",
            "9A3F95",
            "C27E4B",
            "B2B2B2",
            "6C6C6C",
            "96A2CF",
            "93C495",
            "AECFCD",
            "DEA4A5",
            "D7ABD4",
            "D6B87B",
            "FFFFFF",
            "void-space 00",
            "bar-background 01",
            "bar-text 15",
            "terminal-background 15",
            "terminal-line-background 15",
            "terminal-line-highlighted-background 10",
            "terminal-line-text 02",
            "terminal-line-selection-background 02",
            "terminal-line-selection-text 15",
            "error-background 12",
            "translation-error-backgroud 05",
            "translation-warning-backgroud 06",
            "program-error-background 04",
            "alert-background 03",
            "error-text 15",
            "prompt-selected-background 02",
            "prompt-selected-text 15",
            "froggyscript-number-color 01",
            "froggyscript-boolean-color 01",
            "froggyscript-string-color 02",
        ] },
        { name: "swamp-revised", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "000000",// 00
            "31618D",// 01
            "298B27",// 02
            "268B67",// 03
            "753B29",// 04
            "773669",// 05
            "BF833A",// 06
            "97A791",// 07
            "465C3F",// 08
            "8DBDD5",// 09
            "81CB7D",// 10
            "91C9B9",// 11
            "D3977F",// 12
            "CBA9DB",// 13
            "D7D357",// 14
            "FFFFFF",// 15
            "void-space 00",
            "bar-background 01",
            "bar-text 15",
            "terminal-background 15",
            "terminal-line-background 15",
            "terminal-line-highlighted-background 14",
            "terminal-line-text 02",
            "terminal-line-selection-background 02",
            "terminal-line-selection-text 15",
            "error-background 12",
            "translation-error-backgroud 05",
            "translation-warning-backgroud 06",
            "program-error-background 04",
            "alert-background 09",
            "error-text 15",
            "prompt-selected-background 02",
            "prompt-selected-text 15",
            "froggyscript-number-color 01",
            "froggyscript-boolean-color 01",
            "froggyscript-string-color 02",
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
            "void-space 00",
            "bar-background 01",
            "bar-text 15",
            "terminal-background 15",
            "terminal-line-background 15",
            "terminal-line-highlighted-background 14",
            "terminal-line-text 02",
            "terminal-line-selection-background 02",
            "terminal-line-selection-text 15",
            "error-background 12",
            "translation-error-backgroud 05",
            "translation-warning-backgroud 06",
            "program-error-background 04",
            "alert-background 03",
            "error-text 15",
            "prompt-selected-background 02",
            "prompt-selected-text 15",
            "froggyscript-number-color 09",
            "froggyscript-boolean-color 09",
            "froggyscript-string-color 02",
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
        ] },
        { name: "spring", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "-", "=", "Ξ", "="
        ] },
        { name: "fire", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "s", "§", "¿"
        ] },
        { name: "quickloop-in-progress", properties: {transparent: true, read: true, write: true, hidden: false}, data: [
            "Q"
        ] },
        { name: "ask-in-progress", properties: {transparent: true, read: true, write: true, hidden: false}, data: [
            "?"
        ] },
        { name: "prompt-in-progress", properties: {transparent: true, read: true, write: true, hidden: false}, data: [
            "¶"
        ] },
        { name: "securing-in-progress", properties: {transparent: true, read: true, write: true, hidden: false}, data: [
            "§"
        ] }
    ],
})

let config_preproxy = {
    // settings as files
    version: new UserKey(),
    colorPalette: new UserKey(),
    showSpinner: new UserKey(),
    currentSpinner: new UserKey(),
    defaultSpinner: new UserKey(),
    timeFormat: new UserKey(),
    updateStatBar: new UserKey(),
    allowedProgramDirectories: new UserKey(),
    dissallowSubdirectoriesIn: new UserKey(),
    language: new UserKey(),
    validateLanguageOnStartup: new UserKey(),

    // immutable settings
    trustedFiles: [],
    stepThroughProgram: false,
    currentPath: "C:/Home",
    commandHistory: [],
    commandHistoryIndex: 0,
    spinnerIndex: 0,
    osTime: 0,
    currentProgram: "cli",
    programList: ["cli", "lilypad"],
    programSession: 0,
    errorText: "<span class='error'><span class='error-text'>!!ERROR!!</span> -</span>",
    translationErrorText: "<span class='error'><span class='t-error-text'>!!TRANSLATION ERROR!!</span> -</span>",
    translationWarningText: "<span class='error'><span class='t-warning-text'>!TRANSLATION WARNING!</span> -</span>",
    alertText: ("<span class='error'><span class='alert-text'>ALERT</span> -</span>"),
    programErrorText: " -- <span class='error'><span class='program-error-text'>!! -> {{}} <- !!</span></span> --",
}

const diagnostic = {
    total: {
        configGet: 0,
        configSet: 0,
    },
    perSecond: {
        configGet: 0,
        configSet: 0,
    },
    runtime: 0,
    startTime: Date.now(),
    counter: 0,
}

const config = new Proxy(config_preproxy, {
    get: (target, prop) => {
        diagnostic.total.configGet++;
        return target[prop];
    },
    set: (target, prop, value) => {
        diagnostic.total.configSet++;
        target[prop] = value;
        return true;
    }
});

const diagnosticInterval = setInterval(() => {
    diagnostic.perSecond.configGet = Math.ceil(diagnostic.total.configGet / diagnostic.counter);
    diagnostic.perSecond.configSet = Math.ceil(diagnostic.total.configSet / diagnostic.counter);
    diagnostic.runtime = Date.now() - diagnostic.startTime;
    diagnostic.counter++;
}, 1);

const user_config_keys = Object.keys(config_preproxy).filter(key => config_preproxy[key] instanceof UserKey);
const os_config_keys = Object.keys(config_preproxy).filter(key => !(config_preproxy[key] instanceof UserKey)).filter(key => !["trustedFiles"].includes(key));

const setLanguageFiles = () => {
    let langs = {};
    FroggyFileSystem.getDirectory("Config:/langs").forEach(file => {
        langs[file.getName()] = [];
    });
    Object.keys(presetLanguagesMap).forEach((key, i) => {
        langs.lbh.push(key);
        langs.eng.push(presetLanguagesMap[key].eng || key);
        langs.nmt.push(presetLanguagesMap[key].nmt || key);
        langs.jpn.push(presetLanguagesMap[key].jpn || key);
    })
    FroggyFileSystem.getDirectory("Config:/langs").forEach(file => {
        file.write(langs[file.getName()])
    });
}

setLanguageFiles();