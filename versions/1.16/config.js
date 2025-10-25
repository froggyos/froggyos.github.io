//new AllSniffer({});

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
    "T_doesnt_know {{}}": {
        eng: `Froggy doesn't know "{{}}", sorry.`,
        nmt: `Froggy gepele "{{}}", mbayu`,
        jpn: "フロッギーは「{{}}」がわかりません、ごめんなさい"
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
    "T_greeting_2 {{}}": {
        eng: "* Welcome to froggyOS, version {{}} *",
        nmt: "* wulë froggyOS, kekyene {{}} *",
        jpn: "* froggyOSへようこそ！バージョン{{}} *"
    },

    // basic command help ====================
    "T_basic_commands_intro": {
        eng: "* A few basic froggyOS commands *",
        nmt: "* tine hatsamwa komandda me o-froggyOS *",
        jpn: "* いくつかの基本的なfroggyOSコマンド *"
    },
    "T_basic_commands_lang": {
        eng: "changelanguage [code]. . . . . . . Changes the current language.",
        nmt: "changelanguage [koda] . . . . . . . lohi mëzte",
        jpn: "changelanguage [code] . . 現在の言語を変更する"
    },
    "T_basic_commands_palette": {
        eng: "changepalette [palette]. . . . . . Changes the color palette.",
        nmt: "changepalette [paleta].  . . . . . . lohi pesezte paleta",
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
        nmt: "hop [dilekatüli]. . . . . . . . . . tsi dilekatüli wa",
        jpn: "hop [directory] . . ディレクトリに移動する"
    },
    "T_basic_commands_list": {
        eng: "list . . . . . . . . . . . . . . . Lists files and subdirectories in the :sp35:current directory.",
        nmt: "list. . . . . . . . . . . . . . . . seyaya fiyala me nam dilekatülilala me ilo :sp36:dilekatüli wa",
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
        nmt: "metaprop [fiyala] [popatí] [0/1]. . lohi fiyala oәpopatí me",
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
        nmt: "ribbit [memәpelezwisi]. . . . . . . nenta memәpelezwisi",
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
        nmt: `satéte esaya mana. kana "loadstate" ma lohiәte me fene`,
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
        nmt: "tama oәfiyala tsefese dilekatüli wa",
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
    "T_file_cloned {{}}": {
        eng: `File "{{}}" cloned.`,
        nmt: `fiyala "{{}}" mafu mana'a`,
        jpn: "ファイル「{{}}」がクローンされました"
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
    "T_palette_error_invalid_hex {{}}": {
        eng: "PaletteError: {{}} is an invalid hex color.",
        nmt: "PaletaGogowa: {{}} wa sepu hex pesezte",
        jpn: "パレットエラー: {{}}は無効な16進カラーコードです"
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
    "T_lang_does_not_exist {{}}": {
        eng: `Language with code "{{}}" does not exist.`,
        nmt: `mëzte kole "{{}}" getsefese`,
        jpn: "コード「{{}}」の言語が存在しません"
    },
    "T_invalid_lang_file {{}}": {
        eng: `Invalid language file with code "{{}}".`,
        nmt: `sepu mëzte fiyala kole koda "{{}}"`,
        jpn: "コード「{{}}」の言語ファイルは無効です"
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
        nmt: "apelelala som memәpelezwisi nenta",
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
    "T_provide_program_name_line_col": {
        eng: "Please provide a program name, program line, and column.",
        nmt: "T_provide_program_name_line_col",
        jpn: "T_provide_program_name_line_col"
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
        nmt: "gogowa FormatObject (LU GAYANA MEMәPELEWISI) sebesikya",
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

    "T_missing_key_config_user {{}}": {
        eng: "Missing key {{}} in Config:/user",
        nmt: "ndaní koda {{}} kene Config:/user",
        jpn: "T_missing_key_config_user"
    },

    "T_error_reading_config_file": {
        eng: "Error reading config file.",
        nmt: "gogowa sanwa känfikya fiyala",
        jpn: "T_error_reading_config_file"
    },

    // bullfrog commands =========================
    "T_bullfrog_commands_intro": {
        eng: "* A few bullfrog commands *",
        nmt: "* tine bullfrog komandda me o-froggyOS *",
        jpn: "* いくつかのbullfrogコマンド *"
    },
    "T_bullfrog_commands_changepath": {
        eng: "[[BULLFROG]]changepath [path] - Changes the path of the terminal",
        nmt: "[[BULLFROG]]changepath [fiyalātáne] - lohi fiyalātáne oәtaminalu",
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
        nmt: "[[BULLFROG]]setstatbar [memәpelezwisi] - lohi memәpelezwisi status-bar wa",
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
    "T_UNUSED_bullfrog_commands_debugmode": {
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
        nmt: "[[BULLFROG]]triggerdialogue - bene náha memәpelezwisi ndisé",
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

class fs {
    #fs;
    #functionHashes = ['381bf05bf93fffdf', "63f33591efffbfb3", "9af413c39bf77bcf", "943ee33ffefffb3f", "c9bf35d4cdffb7df", "12643adc16e67fdc", "c7e06200e7e4fa7e", "d921574adf257fff", "1838f0a69c3bf1af", "8a9767948bd7ff94", "27858ab87785febc", "bfd42740fffd7fca"]
    #keywordHashes = ['eb6ebeffebfebfff']
    #methodHashes = []

    #cache = new Map();

    hash(inp) {
    function t(k,R){const Q=j();return t=function(m,s){m=m-(-0x212*0x1+0xf3f+0x1*-0xcc5);let Y=Q[m];return Y;},t(k,R);}function F(R,Q,m,s,Y){return t(m-0x112,Q);}(function(R,Q){function I(R,Q,m,s,Y){return t(m-0x2a3,Q);}function W(R,Q,m,s,Y){return t(s-0x398,Y);}function M(R,Q,m,s,Y){return t(Q- -0x261,Y);}function E(R,Q,m,s,Y){return t(Y- -0x21c,R);}function C(R,Q,m,s,Y){return t(R-0x103,Q);}const m=R();while(!![]){try{const s=-parseInt(M(-0x1f0,-0x1f2,-0x1e5,-0x1fb,-0x1f9))/(0x1*0x1933+0xadd+-0x11*0x21f)+parseInt(I(0x304,0x305,0x30d,0x301,0x318))/(0x1*-0x279+-0x60*0x5e+0x25bb)+-parseInt(M(-0x1fa,-0x1ee,-0x1e2,-0x1f1,-0x1e6))/(-0x15ee+0x66d+0xf84)*(-parseInt(M(-0x1f5,-0x1ed,-0x1f5,-0x1f9,-0x1f9))/(-0x1d5e+0x1*-0x15e2+0x3344))+parseInt(M(-0x1de,-0x1e7,-0x1e6,-0x1f0,-0x1f3))/(0x4*0x787+-0x2195*0x1+-0x95*-0x6)*(parseInt(W(0x410,0x41b,0x40f,0x415,0x411))/(-0x54e+0x77c+-0x17*0x18))+-parseInt(C(0x182,0x178,0x178,0x18b,0x186))/(-0x129d+0x26b3*0x1+-0x140f)+parseInt(C(0x175,0x16c,0x182,0x178,0x181))/(-0x6ae+-0x1a83*0x1+0xf*0x237)+-parseInt(M(-0x1e3,-0x1f0,-0x1eb,-0x1e5,-0x1f2))/(-0x67*0x1c+-0x4f9+-0x823*-0x2)*(-parseInt(C(0x171,0x16f,0x16a,0x17b,0x16f))/(-0x17e6+-0xed4+0x2*0x1362));if(s===Q)break;else m['push'](m['shift']());}catch(Y){m['push'](m['shift']());}}}(j,0x4cc21*-0x2+0xdabdb+0x382d2),inp=inp[F(0x186,0x185,0x190,0x19d,0x197)+c(-0x1a5,-0x1b1,-0x1a1,-0x1a6,-0x1a8)](/\n|\r/g,''));function c(R,Q,m,s,Y){return t(R- -0x21c,Y);}function j(){const Z=['\x76\x62\x56\x77\x62','\x63\x65\x41\x6c\x6c','\x6d\x6b\x78\x69\x70','\x72\x65\x76\x65\x72','\x32\x30\x43\x68\x54\x65\x57\x7a','\x47\x4b\x4d\x75\x66','\x74\x72\x69\x6d','\x33\x34\x36\x35\x36\x30\x70\x56\x6b\x7a\x64\x46','\x72\x65\x70\x6c\x61','\x34\x36\x30\x33\x32\x31\x34\x77\x58\x53\x57\x7a\x74','\x4b\x48\x57\x7a\x69','\x49\x64\x46\x49\x6a','\x6a\x6f\x69\x6e','\x6c\x65\x6e\x67\x74','\x31\x33\x31\x31\x32\x33\x32\x52\x73\x6b\x66\x68\x44','\x4e\x66\x4a\x4a\x47','\x69\x44\x41\x6b\x73','\x73\x70\x6c\x69\x74','\x31\x30\x4d\x5a\x7a\x42\x69\x4b','\x36\x38\x36\x37\x30\x31\x63\x65\x49\x6c\x45\x62','\x74\x6f\x53\x74\x72','\x37\x33\x39\x31\x37\x42\x4a\x6e\x48\x77\x4b','\x34\x36\x36\x32\x31\x39\x32\x45\x54\x41\x57\x53\x74','\x33\x4d\x48\x61\x59\x79\x75','\x31\x34\x35\x35\x36\x37\x36\x62\x67\x54\x66\x73\x75','\x69\x6e\x67'];j=function(){return Z;};return j();}let k=()=>{const R={'\x49\x64\x46\x49\x6a':function(x,e,B){return x(e,B);},'\x4e\x66\x4a\x4a\x47':function(x,e){return x(e);},'\x6d\x6b\x78\x69\x70':function(x,e){return x(e);},'\x69\x44\x41\x6b\x73':function(e,B){return e>>>B;},'\x4b\x48\x57\x7a\x69':function(e,B){return e+B;},'\x47\x4b\x4d\x75\x66':function(e,B){return e^B;},'\x76\x62\x56\x77\x62':function(e,B){return e&B;}},Q=x=>x[N(-0x239,-0x242,-0x234,-0x23b,-0x239)+'\x63\x65'](/\r\n|\r/g,'\x0a')[p(-0x25b,-0x26a,-0x267,-0x26d,-0x26d)+'\x63\x65'](/\/\/.*$/gm,'')[r(0x39e,0x392,0x39f,0x397,0x39b)+'\x63\x65'](/\/\*[\s\S]*?\*\//g,'')[p(-0x263,-0x264,-0x267,-0x267,-0x267)+'\x63\x65'](/\s+/g,'\x20')[N(-0x23e,-0x23c,-0x235,-0x246,-0x239)+'\x63\x65'](/\s*([{}();,:=+\-*/<>])\s*/g,'\x24\x31')[p(-0x261,-0x262,-0x269,-0x270,-0x272)]();function N(R,Q,m,s,Y){return c(Y- -0x9b,Q-0x94,m-0x13f,s-0x1b5,s);}function r(R,Q,m,s,Y){return c(s-0x535,Q-0x13e,m-0x9c,s-0x3c,Q);}const m=R[p(-0x26a,-0x26f,-0x264,-0x268,-0x25e)](murmurhash3_32_gc,R[N(-0x256,-0x251,-0x24f,-0x242,-0x24c)](Q,inp),inp[A(-0xc,-0x20,-0x1e,-0x14,-0x19)+'\x68']),s=R[u(-0x175,-0x172,-0x17f,-0x17d,-0x179)](murmurhash3_32_gc,R[A(-0xe,-0x6,0x1,-0x4,-0xa)](Q,inp)[u(-0x193,-0x18e,-0x19e,-0x191,-0x19a)]('')[N(-0x232,-0x24b,-0x236,-0x245,-0x23e)+'\x73\x65']()[r(0x37b,0x375,0x389,0x381,0x37b)](''),inp[N(-0x244,-0x249,-0x248,-0x241,-0x24e)+'\x68']);function A(R,Q,m,s,Y){return c(Y-0x19a,Q-0xb9,m-0x16e,s-0x13e,R);}function p(R,Q,m,s,Y){return F(R-0x2a,Y,m- -0x3f7,s-0x186,Y-0xb3);}function u(R,Q,m,s,Y){return F(R-0x9b,Q,s- -0x310,s-0x15a,Y-0xb6);}const Y=R[r(0x38e,0x390,0x383,0x385,0x379)](R[u(-0x182,-0x171,-0x179,-0x17e,-0x177)](R[N(-0x23d,-0x240,-0x249,-0x247,-0x23c)](m,s),R[r(0x385,0x394,0x387,0x38f,0x388)](m,s)),0x1207+0x2543*-0x1+-0x133c*-0x1);return R[A(0x0,0x9,-0x9,0x5,-0x2)](m[N(-0x241,-0x245,-0x249,-0x23d,-0x247)+r(0x385,0x39b,0x388,0x38e,0x392)](0x10ad+0x11d8+-0x2275),Y[N(-0x246,-0x242,-0x23f,-0x247,-0x247)+A(-0x9,-0x15,-0x16,-0x9,-0xd)](0x1439+0x207+0x1*-0x1630));};return k();
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
        return;
        let stack = new Error().stack.split("\n");
        const caller = stack[stack.length - 2].trim().split(" ")[1];

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

    getDirectory(location) {
        this.#verify();
        const fs = this.#fs;

        return fs[location]?.filter(f => f.getProperty("hidden") !== true) || undefined;
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

    addFileToDirectory(location, file) {
        this.#verify();
        const fs = this.#fs;

        if(fs[location] === undefined) return undefined;
        if(fs[location]?.find(f => f.getName() === file.getName())) return undefined;
        this.#fs[location].push(file);
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
        if(this.#name === "trusted_programs") throw new Error("You may not rename the 'trusted_programs' file.");
        this.#name = newName;
    }

    write(data) {
    if(this.#name === "trusted_programs") throw new Error("You may not write to the 'trusted_programs' file.");
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
        if(this.#name === "trusted_programs") throw new Error("You may not set properties on the 'trusted_programs' file.");
        if (this.#properties[name] !== undefined) {
            this.#properties[name] = value;
        } else return undefined;
    }
}


const FroggyFileSystem = new fs({
    "Config:": [
        { name: "trusted_programs", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "test",
        ] },
        { name: "user", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "KEY language TYPE String VALUE eng END",
            "KEY colorPalette TYPE String VALUE standard END",
            "KEY version TYPE String VALUE 1.16-indev END",
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
            "1 TYPE Boolean VALUE Ribbit!",
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
        { name: "cli", properties: {transparent: false, read: false, write: false, hidden: true}, data: ["quietkill"] },
        { name: "lilypad", properties: {transparent: false, read: false, write: false, hidden: true}, data: ["quietkill"] },
        { name: "kaerugotchi", properties: {transparent: false, read:true, write: true, hidden: false}, data: [
            "pfunc @display_frog ['display_head:S'] {",
            "    if display_head>eq('default') {",
            "        out '  o..o'",
            "    }",
            "    if display_head>eq('hungry') {",
            "        out '  o..o'",
            "    }",
            "    if display_head>eq('drowsy') {",
            "        out '  =..='",
            "    }",
            "    if display_head>eq('sleepy') {",
            "        out '  _.._ .zZ'",
            "    }",
            "    if display_head>eq('happy') {",
            "        out '  ^..^'",
            "    }",
            "    if display_head>eq('confused') {",
            "        out '  @..@'",
            "    }",
            "    if display_head>eq('angry') {",
            "        out '  >..<'",
            "    }",
            "    if display_head>eq('sad') {",
            "        out '  q..q'",
            "    }",
            "    if display_head>eq('unamused') {",
            "        out '  -..-'",
            "    }",
            "    if display_head>eq('dead') {",
            "        out '  x..x'",
            "    }",
            "    if display_head>eq('hungry') {",
            "        out ' (~~~~)'",
            "    }",
            "    else {",
            "        out ' (----)'",
            "    }",
            "    if display_head>eq('dead') {",
            "        out '( v__v )'",
            "    }",
            "    else {",
            "        out '( >__< )'",
            "    }",
            "    out '^^    ^^'",
            "}",
            "func @setCurrentMood {",
            "    if :food < 10: {",
            "        set $currentMood = 'hungry'",
            "        exit",
            "    }",
            "    if :energy < 5: {",
            "        set $currentMood = 'sleepy'",
            "        exit",
            "    }",
            "    if :energy < 15: {",
            "        set $currentMood = 'drowsy'",
            "        exit",
            "    }",
            "    if :happiness < 5: {",
            "        set $currentMood = 'sad'",
            "        exit",
            "    }",
            "    if :happiness < 15: {",
            "        set $currentMood = 'unamused'",
            "        exit",
            "    }",
            "    if :happiness > 40: {",
            "        set $currentMood = 'happy'",
            "        exit",
            "    }",
            "}",
            "",
            "var currentMood = 'default'",
            "",
            "var day = 1",
            "var coin = 20",
            "var energy = 40",
            "var food = 40",
            "var health = 50",
            "var happiness = 20",
            "",
            "var selectedAction = ''",
            "var lastChosenAction = 0",
            "var actions = ['feed', 'play', 'sleep', 'work', 'quit']",
            "",
            "func @outputStatus {",
            "    out '     coin: ' + coin",
            "    out '   health: ' + '#'>repeat(health)",
            "    out '   energy: ' + '#'>repeat(energy)",
            "    out '     food: ' + '#'>repeat(food)",
            "    out 'happiness: ' + '#'>repeat(happiness)",
            "}",
            "",
            "loop :true: {",
            "    clearterminal",
            "    out 'Day #' + day",
            "    out ' '",
            "",
            "    if :coin < 0: {",
            "        set $coin = 0",
            "    }",
            "    if :energy < 0: {",
            "        set $energy = 0",
            "    }",
            "    if :food < 0: {",
            "        set $food = 0",
            "    }",
            "    if :happiness < 0: {",
            "        set $happiness = 0",
            "    }",
            "    if :health < 0: {",
            "        set $health = 0",
            "    }",
            "",
            "    call @outputStatus",
            "    call @setCurrentMood",
            "    pcall @display_frog [currentMood]",
            "",
            "    prompt $selectedAction lastChosenAction actions",
            "    set $lastChosenAction = actions>indexOf(selectedAction)",
            "    if selectedAction>eq('quit') {",
            "        quietkill",
            "    }",
            "",
            "    if :health == 0: {",
            "        clearterminal",
            "        out 'Day #' + day",
            "        out ' '",
            "        pcall @display_frog [currentMood]",
            "        wait 2000",
            "        clearterminal",
            "        out 'Day #' + day",
            "        out ' '",
            "        pcall @display_frog ['dead']",
            "        out 'Your frog has died...'",
            "        quietkill",
            "    }",
            "",
            "    if selectedAction>eq('feed') {",
            "        if :coin > 5: {",
            "            set $food = food>add(10)",
            "            set $happiness = happiness>add(1)",
            "            set $energy = energy>add(5)",
            "            set $coin = coin>sub(5)",
            "        }",
            "        else {",
            "            continue",
            "        }",
            "    }",
            "",
            "    if selectedAction>eq('play') {",
            "        if :energy > 5: {",
            "            set $happiness = happiness>add(5)",
            "            set $energy = energy>sub(5)",
            "            set $food = food>sub(2)",
            "        }",
            "        else {",
            "            continue",
            "        }",
            "    }",
            "",
            "    if selectedAction>eq('sleep') {",
            "        set $energy = energy>add(15)",
            "    }",
            "",
            "    if selectedAction>eq('work') {",
            "        if :energy > 10: {",
            "            set $coin = coin>add(15)",
            "            set $energy = energy>sub(10)",
            "            set $food = food>sub(5)",
            "            set $happiness = happiness>sub(5)",
            "            set $health = health>sub(5)",
            "        }",
            "        else {",
            "            continue",
            "        }",
            "    }",
            "",
            "    set $day = day>inc",
            "    set $food = food>sub(4)",
            "",
            "    if :food > 60: {",
            "        set $food = 60",
            "    }",
            "    if :energy > 60: {",
            "        set $energy = 60",
            "    }",
            "    if :happiness > 60: {",
            "        set $happiness = 60",
            "    }",
            "    if :health > 60: {",
            "        set $health = 60",
            "    }",
            "}"

        ]},
        // x = 78
        // y = 59
        { name: "test", properties: {transparent: true, read: true, write: true, hidden: false }, data: [
            // "var _2darray = [1,2,3,4]",
            // "out _2darray>join",
            // "set $_2darray = _2darray>shift",
            // "out _2darray>join",
            // "var userInput = ''",
            // "ask $userInput 'Type something:'",
            // "out userInput",
        //     "var arrayVariable = ['apple', 'banana', 'cherry']",
        //     "var string = 'FroggyOS'",
        //     "var string2 = 'meow!'",
        //     "var sting = 'string'",
        //     "var object = {",
        //     "   'string' = 'FroggyOS'>concat(' meow ')",
        //     "   'number' = 1",
        //     "    string = 'wow!'",
        //     "   'array' = ['frog', 'dog', 'cat'>type]",
        //     "   'arrayVariable' = arrayVariable>type",
        //     "   'nestedObject' = {",
        //     "       string2 = 'value'",
        //     "       'anotherKey' = 42",
        //     "   }",
        //     "}",
        //     "",
        //    "set $object.'string' = $object.'string' + ' is cool!'",
        //    "out $object",
            "pfunc @meow ['meow:S'] {",
            "    ou",
            "    out meow",
            "}",
            "",
            "pcall @meow ['Hello, World!']",
        ] },
        { name: "snake", properties: {transparent: false, read: true, write: true, hidden: false }, data: [
            "import 'keyboard'",
            "import 'math'",
            "",
            "clearterminal",
            "",
            "var snakeX = [5, 5, 5, 5]",
            "var snakeY = [5, 6, 7, 8]",
            "",
            "var drawY = 0",
            "",
            "var row = ''",
            "",
            "var width = 15",
            "var height = 15",
            "",
            "var headX = 0",
            "var headY = 0",
            "",
            "var applesX = []",
            "var applesY = []",
            "",
            "loop 5 {",
            "     set $applesX = applesX>push(math>random(1, width>sub(2)))",
            "     set $applesY = applesY>push(math>random(1, height>sub(2)))",
            "}",
            "",
            "var direction = 'right'",
            "",
            "keydown 'd' {",
            "    if direction>neq('left') {",
            "       set $direction = 'right'",
            "    }",
            "}", 
            "keydown 'a' {",
            "    if direction>neq('right') {",
            "       set $direction = 'left'",
            "    }",
            "}",
            "keydown 's' {",
            "    if direction>neq('up') {",
            "       set $direction = 'down'",
            "    }",
            "}",
            "keydown 'w' {",
            "    if direction>neq('down') {",
            "        set $direction = 'up'",
            "    }",
            "}",
            "var score = 0",
            "",
            "var snakeXDraw = 0",
            "var snakeYDraw = 0",
            "",
            "var appleX = 0",
            "var appleY = 0",
            "",
            "var ate = false",
            "var collision = false",
            "var dudX = 0",
            "var dudY = 0",
            "",
            "loop :true: {",
            "    clearterminal",
            "    out 'WASD to move'",
            "    set $drawY = 0",
            "    set $headX = snakeX>last",
            "    set $headY = snakeY>last",
            "",
            "    if direction>eq('right') {",
            "        set $headX = headX>inc",
            "        if :headX >= width: {",
            "            set $headX = 0",
            "        }",
            "    }",
            "    if direction>eq('left') {",
            "        set $headX = headX>dec",
            "        if :headX < 0: {",
            "            set $headX = width>dec",
            "        }",
            "    }",
            "    if direction>eq('down') {",
            "        set $headY = headY>inc",
            "        if :headY > height: {",
            "            set $headY = 0",
            "        }",
            "    }",
            "    if direction>eq('up') {",
            "        set $headY = headY>dec",
            "        if :headY < 1: {",
            "            set $headY = height",
            "        }",
            "    }",
            "",
            "    loop applesX>length {",
            "        set $appleX = applesX>index(__loop_index__)",
            "        set $appleY = applesY>index(__loop_index__)",
            "        if :headX == appleX & headY == appleY: {",
            "            set $ate = true",
            "            set $score = score>inc",
            "            set $applesX = applesX>splice(__loop_index__, 1)",
            "            set $applesY = applesY>splice(__loop_index__, 1)",
            "            set $applesX = applesX>push(math>random(1, width>sub(2)))",
            "            set $applesY = applesY>push(math>random(1, height>sub(2)))",
            "        }",
            "    }",
            "",
            "    if :ate == false: {",
            "        set $snakeX = snakeX>shift",
            "        set $snakeY = snakeY>shift",
            "    }",
            "",
            "    set $snakeX = snakeX>push(headX)",
            "    set $snakeY = snakeY>push(headY)",
            "",
            "    loop height {",
            "        set $row = '.'>repeat(width)",
            "",
            "        set $drawY = drawY>inc",
            "",
            "        loop snakeX>length {",
            "            set $snakeXDraw = snakeX>index(__loop_index__)",
            "            set $snakeYDraw = snakeY>index(__loop_index__)",
            "            if :snakeYDraw == drawY: {",
            "                set $row = row>replaceAt(snakeXDraw, '#')", 
            "            }",
            "            set $dudX = snakeX>length>dec",
            "            if :(__loop_index__ < dudX) & headX == snakeXDraw & headY == snakeYDraw: {",
            "                set $collision = true",
            "            }",
            "        }",

            "        loop applesX>length {",
            "            set $appleX = applesX>index(__loop_index__)",
            "            set $appleY = applesY>index(__loop_index__)",
            "            if :appleY == drawY: {",
            "                set $row = row>replaceAt(appleX, '@')",
            "            }",
            "        }",
            "",
            "        if :headY == drawY: {",
            "            set $row = row>replaceAt(headX, 'O')",
            "        }",
            "",
            "        set $ate = false",
            "        out row",
            "    }",
            "    if :collision == true: {",
            "        out 'Game Over! Final Score: ' + score",
            "        break",
            "    }",
            "    wait 200",
            "}",
        ] },
        { name: "error-levels", properties: {transparent: false, read: true, write: true, hidden: true}, data: [
            // "error 0, 'alert', 'hey look here! read me!'",
            // "error 1, 'warning', 'something might be wrong'",
            // "error 2, 'error', 'something went wrong'",
            // "error 3, 'important warning', 'something is wrong but its not too bad'",
            // "error 4, 'important error', 'something is wrong and it is bad'",
            // "error 5, 'critical error', 'something is wrong and it is very bad'",
            // "error 6, 'fatal error', 'the frog is dead'",
        ] },
        { name: "outf-test", properties: {transparent: true, read: true, write: true, hidden: false}, data: [
            // "arr meow = $4, 48$",
            // 'outf "t=c01,i=1" , "this is blue text"',
            // 'outf "b=c00" , "this is a black background"',
            // 'outf "t=c06, b=c01" , "this is brown text on a blue background"',
            // 'outf "t=c01, tr=0-21" , "from char 0 to char 21, the text will be blue" ',
            // 'outf "t=c01, tr=meow>index(0)-meow>index(1) | b=c04, br=57-91" , "from the char 4 to char 48, the text will be blue. AND from char 57 to char 91 the background will be red" ',
            // "clearterminal",
        ] },
        { name: "fibonacci", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "var a = 0",
            "var b = 1",
            "var temp = 0",
            "var times = ''",
            "",
            "ask $times 'How many Fibonacci numbers would you like to generate?'",
            "",
            "loop times>toNumber {",
            "   out a",
            "   set $b = a>add(b)",
            "   set $a = temp",
            "   set $temp = b",
            "}"
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
            "error-severity-0 03",
            "error-severity-1 13",
            "error-severity-2 12",
            "error-severity-3 05",
            "error-severity-4 06",
            "error-severity-5 04",
            "error-severity-6 08",
            "error-text 15",
            "prompt-selected-background 02",
            "prompt-selected-text 15",
            "froggyscript-number-color 09",
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
            "error-severity-0 03",
            "error-severity-1 13",
            "error-severity-2 12",
            "error-severity-3 05",
            "error-severity-4 06",
            "error-severity-5 04",
            "error-severity-6 08",
            "prompt-selected-background 02",
            "prompt-selected-text 15",
            "froggyscript-number-color 09",
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
            "error-severity-0 03",
            "error-severity-1 13",
            "error-severity-2 12",
            "error-severity-3 05",
            "error-severity-4 06",
            "error-severity-5 04",
            "error-severity-6 08",
            "error-text 15",
            "prompt-selected-background 02",
            "prompt-selected-text 15",
            "froggyscript-number-color 09",
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
            "error-severity-0 03",
            "error-severity-1 13",
            "error-severity-2 12",
            "error-severity-3 05",
            "error-severity-4 06",
            "error-severity-5 04",
            "error-severity-6 08",
            "error-text 15",
            "prompt-selected-background 02",
            "prompt-selected-text 15",
            "froggyscript-number-color 09",
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
            "error-severity-0 03",
            "error-severity-1 13",
            "error-severity-2 12",
            "error-severity-3 05",
            "error-severity-4 06",
            "error-severity-5 04",
            "error-severity-6 08",
            "error-text 15",
            "prompt-selected-background 02",
            "prompt-selected-text 15",
            "froggyscript-number-color 01",
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
            "error-severity-0 03",
            "error-severity-1 13",
            "error-severity-2 12",
            "error-severity-3 05",
            "error-severity-4 06",
            "error-severity-5 04",
            "error-severity-6 08",
            "error-text 15",
            "prompt-selected-background 02",
            "prompt-selected-text 15",
            "froggyscript-number-color 01",
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
            "error-severity-0 03",
            "error-severity-1 13",
            "error-severity-2 12",
            "error-severity-3 05",
            "error-severity-4 06",
            "error-severity-5 04",
            "error-severity-6 08",
            "error-text 15",
            "prompt-selected-background 02",
            "prompt-selected-text 15",
            "froggyscript-number-color 09",
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
    trustedPrograms: [],
    stepThroughProgram: false,
    currentPath: "C:/Home",
    commandHistory: [],
    commandHistoryIndex: 0,
    spinnerIndex: 0,
    osTime: 0,
    currentProgram: "cli",
    programList: ["cli", "lilypad"],
    programSession: 0,
    errorText: createErrorText(2, "!!ERROR!!"),
    translationErrorText: createErrorText(4, "Translation Error"),
    translationWarningText: createErrorText(3, "Translation Warning"),
    alertText: createErrorText(0, "ALERT"),
    programErrorText: " -- <span class='error'><span class='error-severity-5'>!! -> {{}} <- !!</span></span> --",
    fatalErrorText: createErrorText(6, "Fatal Error"),
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
    get: (target, prop, value) => {
        diagnostic.total.configGet++;
        return target[prop];
    },
    set: (target, prop, value) => {
        diagnostic.total.configSet++;
        let stack = new Error().stack.split("\n").slice(2).map(line => line.trim());
        if(stack.some(line => line.includes("at #verify"))) {
            return true;
        }
        target[prop] = value;
        return true;
    }
});

function createErrorText(severity, message){
    return `<span class='error'><span class='error-severity-${severity}'>${message}</span> -</span>`
}

const diagnosticInterval = setInterval(() => {
    diagnostic.perSecond.configGet = Math.ceil(diagnostic.total.configGet / diagnostic.counter);
    diagnostic.perSecond.configSet = Math.ceil(diagnostic.total.configSet / diagnostic.counter);
    diagnostic.runtime = Date.now() - diagnostic.startTime;
    diagnostic.counter++;
}, 1000);

const user_config_keys = Object.keys(config_preproxy).filter(key => config_preproxy[key] instanceof UserKey);
const os_config_keys = Object.keys(config_preproxy).filter(key => !(config_preproxy[key] instanceof UserKey)).filter(key => !["trustedFiles"].includes(key));

const setLanguageFiles = () => {
    let langs = {};
    FroggyFileSystem.getDirectory("Config:/langs").forEach(file => {
        langs[file.getName()] = [];
    });
    Object.keys(presetLanguagesMap).forEach((key, i) => {
        langs.lbh.push(key);
        if(presetLanguagesMap[key]?.eng) langs.eng.push(presetLanguagesMap[key].eng);
        if(presetLanguagesMap[key]?.nmt) langs.nmt.push(presetLanguagesMap[key].nmt);
        if(presetLanguagesMap[key]?.jpn) langs.jpn.push(presetLanguagesMap[key].jpn);
    })
    FroggyFileSystem.getDirectory("Config:/langs").forEach(file => {
        file.write(langs[file.getName()])
    });
}

setLanguageFiles();

/*
change the hash cache to a set bc its faster
work on the config proxy object verification


*/