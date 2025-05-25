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

const config = {
    // settings as files
    version: null,
    colorPalette: null,
    showSpinner: null,
    currentSpinner: null,
    defaultSpinner: null,
    timeFormat: null,
    updateStatBar: null,
    allowedProgramDirectories: null,
    dissallowSubdirectoriesIn: null,
    language: null,
    validateLanguageOnStartup: null,

    // immutable settings
    trustedFiles: [],
    stepThroughProgram: false,
    currentPath: 'C:/Home',
    commandHistory: [],
    commandHistoryIndex: -1,
    spinnerIndex: 0,
    currentProgram: "cli",
    programList: ["cli", "lilypad"],
    programSession: 0,
    errorText: "<span class='error'><span class='error-text'>!!ERROR!!</span> -</span>",
    translationErrorText: "<span class='error'><span class='t-error-text'>!!TRANSLATION ERROR!!</span> -</span>",
    translationWarningText: "<span class='error'><span class='t-warning-text'>!TRANSLATION WARNING!</span> -</span>",
    alertText: "<span class='error'><span class='alert-text'>ALERT</span> -</span>",
    programErrorText: " -- <span class='error'><span class='program-error-text'>!! -> {{}} <- !!</span></span> --",

    // filesystem
    fileSystem: {
        "Config:": [
            { name: "trusted_files", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                "test",
            ] },
            { name: "user", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
                "KEY language TYPE String VALUE eng END",
                "KEY debugMode TYPE Boolean VALUE false END",
                "KEY colorPalette TYPE String VALUE standard END",
                "KEY version TYPE String VALUE 1.14-indev END",
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
            { name: "lbh", properties: {transparent: true, read: true, write: false, hidden: false}, data: ["!LANGNAME: language build helper"] },
            { name: "eng", properties: {transparent: false, read: true, write: true, hidden: false}, data: ["!LANGNAME: English"] },
            { name: "nmt", properties: {transparent: false, read: true, write: true, hidden: false}, data: ["!LANGNAME: ngimëte"] },
            { name: "jpn", properties: {transparent: false, read: true, write: true, hidden: false}, data: ["!LANGNAME: Japanese"] },
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
                "createscreen 79,58",
                "rect meow = $0, 0, 10, 10$",
                "rect meow2 = $11, 0, 10, 10$",
                ".meow>render",
                ".meow2>render",
                ".meow>size(30, 30)",
                ".meow2>move(20, 20)",
                ".meow>fill('c02')",
                ".meow>stroke('c04')",
                ".meow>remove",
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
                "m $1",
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
                "prompt-selected-text 15"
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
                "prompt-selected-text 15"
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
                "prompt-selected-text 15"
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
                "prompt-selected-text 15"
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
                "prompt-selected-text 15"
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
                "prompt-selected-text 15"
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
                "prompt-selected-text 15"
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
        ],
    }
}

const user_config_keys = Object.keys(structuredClone(config)).filter(key => structuredClone(config)[key] === null);
const os_config_keys = Object.keys(structuredClone(config)).filter(key => structuredClone(config)[key] !== null).filter(key => !["fileSystem", "trustedFiles"].includes(key));

Object.keys(presetLanguagesMap).forEach((key, i) => {
    config.fileSystem["Config:/langs"][0].data.push(Object.keys(presetLanguagesMap)[i])
    if(presetLanguagesMap[key].eng != undefined) config.fileSystem["Config:/langs"][1].data.push(presetLanguagesMap[key].eng);
    if(presetLanguagesMap[key].nmt != undefined) config.fileSystem["Config:/langs"][2].data.push(presetLanguagesMap[key].nmt);
    if(presetLanguagesMap[key].jpn != undefined) config.fileSystem["Config:/langs"][3].data.push(presetLanguagesMap[key].jpn);
})