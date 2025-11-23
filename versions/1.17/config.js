//new AllSniffer({});


// generate a 16 bit hex string
const gen = (len=8, r=16) => [...Array(len)].map(()=>Math.floor(Math.random()*r).toString(r)).join("");
const sessionTokenFile = gen(16);
const credentialFile = gen(16);

class TroubleManager {
    static governors = {};

    /**
     * 
     * @param {string} name 
     * @param {Governor} governor 
     */
    static registerGovernor(name, governor){
        this.governors[name] = governor;
    }

    static getGovernor(name){
        return this.governors[name];
    }

    static hasTrouble(){
        for(const govName in this.governors){
            if(!this.governors[govName].ok) return true;
        }
        return false;
    }
}

class Governor {
    constructor(name, intervalMs, fn){
        this.name = name;
        this.intervalMs = intervalMs;
        this.fn = fn;
        this.troubles = new Set();
        this.ok = true;
        this.interval = setInterval(() => {
            if(!TroubleManager.governors[this.name].ok) return;
            this.fn();
        }, this.intervalMs);

        TroubleManager.registerGovernor(this.name, this);
    }

    registerTrouble(trouble){
        this.troubles.add(trouble);
        if(this.ok) this.ok = false;
    }

    removeTrouble(trouble){
        this.troubles.delete(trouble);
        if(this.troubles.size === 0) this.ok = true;
    }

    getRecommendedActions(){
        const actions = new Set();
        this.troubles.forEach(trouble => {
            if(trouble.startsWith("tpfm")) actions.add({
                action: "regentrustedprogramfile",
                description: "Regenerate the trusted program file",
                trouble
            })
            else if (trouble.startsWith("buc/mk")) {
                let key = trouble.split("-")[1];
                actions.add({
                    action: "regenkey "+key,
                    description: `Regenerate the key: ${key}`,
                    trouble
                })
            }
            else if(trouble.startsWith("buc/gone")) actions.add({
                action: "regenuserfile",
                description: "Regenerate the user file",
                trouble
            })
            else if(trouble.startsWith("buc/fe")) actions.add({
                action: "unknown",
                description: "unknown",
                trouble
            })
            else if (trouble.startsWith("buc/nldm")) actions.add({
                action: "regenlangfiles",
                description: "Regenerate the language files",
                trouble
            })
        });
        return Array.from(actions);
    }
}

// https://www.ibm.com/plex/languages/

const presetLanguagesMap = {
    // general stuff ==========================
    "!LANGNAME: language descriptor map": {
        eng: "!LANGNAME: English",
        nmt: "!LANGNAME: ngimëte",
        jpn: "!LANGNAME: Japanese",
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
    "T_doesnt_know {{}}": {
        eng: `Froggy doesn't know "{{}}", sorry.`,
        nmt: `Froggy gepele "{{}}", mbayu`,
        jpn: "フロッギーは「{{}}」がわかりません、ごめんなさい"
    },
    "T_froggy_doesnt_like": {
        eng: "Froggy doesn't like that. >:(",
        nmt: "Froggy gehana ilu >:(",
        jpn: "フロッギーはそれが気に入らないよ >:("
    },
    "T_hello_froggy": {
        eng: "Hello, I'm Froggy! ^v^",
        nmt: "i katálo, mo Froggy! ^v^",
        jpn: "どうも、フロッギーです！^v^"
    },
    "T_intj_yes": {
        eng: "Yes",
        nmt: "owa",
        jpn: "T_intj_yes",
    },
    "T_intj_no": {
        eng: "No",
        nmt: "ge",
        jpn: "T_intj_no",
    },
    "T_intj_ok": {
        eng: "OK",
        nmt: "OWA",
        jpn: "T_intj_ok",
    },
    "T_intj_error": {
        eng: "ERROR",
        nmt: "GOGOWA",
        jpn: "T_intj_error",
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
    "T_basic_commands_exportfile": {
        eng: "exportfile [file]. . . . . . . . . Exports a froggyOS file as a .txt file.",
        nmt: "T_basic_commands_exportfile",
        jpn: "T_basic_commands_exportfile",
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
    "T_basic_commands_pulse": {
        eng: "pulse. . . . . . . . . . . . . . . Displays system information.",
        nmt: "T_basic_commands_pulse",
        jpn: "T_basic_commands_pulse",
    },
    "T_basic_commands_pond": {
        eng: "pond [options] . . . . . . . . . . Connects to the pond server.",
        nmt: "T_basic_commands_pond",
        jpn: "T_basic_commands_pond",
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
        eng: "spy [file] . . . . . . . . . . . . Reads the file and outputs it to the :sp35:terminal. Will also output certain :sp35:statistics about the file.",
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
    "T_invalid_file_name_chars": {
        eng: "Invalid characters in file name.",
        nmt: "T_invalid_file_name_chars",
        jpn: "T_invalid_file_name_chars"
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
    "T_no_permission_to_export_file": {
        eng: "You do not have permission to export this file.",
        nmt: "T_no_permission_to_export_file",
        jpn: "T_no_permission_to_export_file"
    },
    "T_no_permission_to_clone": {
        eng: "You do not have permission to clone this file.",
        nmt: "'a gewitsuyo pamason ", // CONTINUE
        jpn: "このファイルをクローンする権限がありません"
    },
    "T_no_permission_to_rename_file": {
        eng: "You do not have permission to rename this file.",
        nmt: "'a gewitsuyo pamason som'on tama ma lu fiyala",
        jpn: "このファイル名を変更する権限がありません"
    },
    "T_no_permission_to_delete_file": {
        eng: "You do not have permission to delete this file.",
        nmt: "na gewitsuyo pamason nggave ilo fiyala",
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
    "T_file_exported": {
        eng: "File exported.",
        nmt: "T_file_exported",
        jpn: "T_file_exported",
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
    "T_file_info_intro": {
        eng: "* File Information *",
        nmt: "T_file_info_intro",
        jpn: "T_file_info_intro"
    },
    "T_file_info_size {{}}": {
        eng: ":sp5:Size: {{}}",
        nmt: "T_file_info_size {{}}",
        jpn: "T_file_info_size {{}}"
    },
    "T_file_info_type_text": {
        eng: ":sp5:Type: Text",
        nmt: "T_file_info_type_text",
        jpn: "T_file_info_type_text"
    },
    "T_file_info_type_program": {
        eng: ":sp5:Type: FroggyScript3",
        nmt: "T_file_info_type_program",
        jpn: "T_file_info_type_program"
    },
    "T_file_info_type_palette": {
        eng: ":sp5:Type: Color Palette",
        nmt: "T_file_info_type_palette",
        jpn: "T_file_info_type_palette"
    },
    "T_file_info_type_macro": {
        eng: ":sp5:Type: Command Macro",
        nmt: "T_file_info_type_macro",
        jpn: "T_file_info_type_macro"
    },
    "T_file_info_type_spinner": {
        eng: ":sp5:Type: Loading Spinner",
        nmt: "T_file_info_type_spinner",
        jpn: "T_file_info_type_spinner"
    },
    "T_file_info_type_program_data": {
        eng: ":sp5:Type: froggyOS Structured Data Storage",
        nmt: "T_file_info_type_program_data",
        jpn: "T_file_info_type_program_data"
    },
    "T_file_info_type_language": {
        eng: ":sp5:Type: Language File",
        nmt: "T_file_info_type_language",
        jpn: "T_file_info_type_language"
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
    "T_directory_does_not_exist {{}}": {
        eng: "Directory \"{{}}\" does not exist.",
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
    "T_cannot_create_directories_here": {
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
        nmt: "makulo me gewitsu mana",
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
        eng: `Current language file is INVALID! Switching to "ldm".`,
        nmt: `i mewana mëzte fiyala wa SEPE. lohi "ldm"`,
        jpn: `現在の言語ファイルが無効です！「ldm」に切り替えています`
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
    "T_provide_valid_t_desc": {
        eng: "Please provide a valid translation descriptor.",
        nmt: "apelelala som apeya mëmëzte dësikipita",
        jpn: "有効な翻訳ディスクリプターを入力してください"
    },
    "T_missing_key_config_user {{}}": {
        eng: "Missing key {{}} in Config:/user.",
        nmt: "ndaní koda {{}} kene Config:/user.",
        jpn: "T_missing_key_config_user"
    },
    "T_user_config_does_not_exist": {
        eng: "User Config does not exist.",
        nmt: "T_user_config_does_not_exist",
        jpn: "T_user_config_does_not_exist"
    },
    "T_trusted_programs_file_missing": {
        eng: "Missing Config:/trusted_programs",
        nmt: "T_trusted_programs_file_missing",
        jpn: "T_trusted_programs_file_missing"
    },
    "T_error_reading_config_file": {
        eng: "Error reading config file.",
        nmt: "gogowa sanwa känfikya fiyala",
        jpn: "T_error_reading_config_file"
    },
    "T_invalid_command_argument {{}}": {
        eng: `Invalid command argument: "{{}}"`,
        nmt: `T_invalid_command_argument {{}}`,
        jpn: "T_invalid_command_argument {{}}"
    },

    // pulse =====================================
    "T_pulse_info_intro": {
        eng: "* Pulse Information *",
        nmt: "T_pulse_info_intro",
        jpn: "T_pulse_info_intro"
    },
    "T_pulse_system_info": {
        eng: "* System Information *",
        nmt: "T_pulse_system_info",
        jpn: "T_pulse_system_info"
    },
    "T_pulse_system_uptime {{}}": {
        eng: "uptime: {{}}",
        nmt: "T_pulse_system_uptime {{}}",
        jpn: "T_pulse_system_uptime {{}}"
    },
    "T_pulse_fs_size {{}}": {
        eng: "file system size: {{}}",
        nmt: "T_pulse_fs_size {{}}",
        jpn: "T_pulse_fs_size {{}}"
    },
    "T_pulse_program_session {{}}": {
        eng: "current program session: {{}}",
        nmt: "T_pulse_program_session {{}}",
        jpn: "T_pulse_program_session {{}}"
    },
    "T_pulse_language {{}}": {
        eng: "current language: {{}}",
        nmt: "T_pulse_language {{}}",
        jpn: "T_pulse_language {{}}"
    },
    "T_pulse_palette {{}}": {
        eng: "current color palette: {{}}",
        nmt: "T_pulse_palette {{}}",
        jpn: "T_pulse_palette {{}}"
    },
    "T_pulse_version {{}}": {
        eng: "version: {{}}",
        nmt: "T_pulse_version {{}}",
        jpn: "T_pulse_version {{}}"
    },
    "T_pulse_governers": {
        eng: "* Governers *",
        nmt: "* semes me *",
        jpn: "T_pulse_governers"
    },
    "T_pulse_config": {
        eng: "* Config *",
        nmt: "T_pulse_config",
        jpn: "T_pulse_config"
    },
    "T_pulse_reads": {
        eng: "* File Reads *",
        nmt: "T_pulse_reads",
        jpn: "T_pulse_reads"
    },
    "T_pulse_writes": {
        eng: "* File Writes *",
        nmt: "T_pulse_writes",
        jpn: "T_pulse_writes"
    },
    "T_pulse_abbr_last_second": {
        eng: "Last",
        nmt: "T_pulse_abbr_last_second",
        jpn: "T_pulse_abbr_last_second"
    },
    "T_pulse_abbr_average": {
        eng: "Avg",
        nmt: "T_pulse_abbr_average",
        jpn: "T_pulse_abbr_average"
    },
    "T_pulse_abbr_total": {
        eng: "Total",
        nmt: "T_pulse_abbr_total",
        jpn: "T_pulse_abbr_total"
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
    "T_bullfrog_commands_diagtable": {
        eng: "[[BULLFROG]]diagnosticstable - Displays the diagnostic table in the developer console",
        nmt: "T_bullfrog_commands_diagtable",
        jpn: "T_bullfrog_commands_diagtable"
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
    "T_bullfrog_commands_recoverymode": {
        eng: "[[BULLFROG]]recoverymode - Enters recovery mode",
        nmt: "T_bullfrog_commands_recoverymode",
        jpn: "T_bullfrog_commands_recoverymode"
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
        nmt: "yg",
        jpn: "日"
    },
    "T_date_short_monday": {
        eng: "Mon",
        nmt: "yl",
        jpn: "月"
    },
    "T_date_short_tuesday": {
        eng: "Tue",
        nmt: "yb",
        jpn: "火"
    },
    "T_date_short_wednesday": {
        eng: "Wed",
        nmt: "ys",
        jpn: "水"
    },
    "T_date_short_thursday": {
        eng: "Thu",
        nmt: "yk",
        jpn: "木"
    },
    "T_date_short_friday": {
        eng: "Fri",
        nmt: "ym",
        jpn: "金"
    },
    "T_date_short_saturday": {
        eng: "Sat",
        nmt: "yw",
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
        nmt: "ylge",
        jpn: "1月"
    },
    "T_date_short_february": {
        eng: "Feb",
        nmt: "ylla",
        jpn: "2月"
    },
    "T_date_short_march": {
        eng: "Mar",
        nmt: "ylbe",
        jpn: "3月"
    },
    "T_date_short_april": {
        eng: "Apr",
        nmt: "ylsa",
        jpn: "4月"
    },
    "T_date_short_may": {
        eng: "May",
        nmt: "ylki",
        jpn: "5月"
    },
    "T_date_short_june": {
        eng: "Jun",
        nmt: "ylmo",
        jpn: "6月"
    },
    "T_date_short_july": {
        eng: "Jul",
        nmt: "ylwé",
        jpn: "7月"
    },
    "T_date_short_august": {
        eng: "Aug",
        nmt: "ylan",
        jpn: "8月"
    },
    "T_date_short_september": {
        eng: "Sep",
        nmt: "ylmi",
        jpn: "9月"
    },
    "T_date_short_october": {
        eng: "Oct",
        nmt: "ylkó",
        jpn: "10月"
    },
    "T_date_short_november": {
        eng: "Nov",
        nmt: "ylkg",
        jpn: "11月"
    },
    "T_date_short_december": {
        eng: "Dec",
        nmt: "ylkl",
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

    // misc interjections =========================
    "T_pond_attention": {
        eng: "ATTENTION!",
        nmt: "T_pond_attention",
        jpn: "T_pond_attention"
    },

    // pond =============================================================================

    // server connectivity =============================
    "T_pond_checking": {
        eng: "Checking Pond server...",
        nmt: "T_pond_checking",
        jpn: "T_pond_checking"
    },
    "T_pond_server_ok": {
        eng: "Pond server is up!",
        nmt: "T_pond_server_ok",
        jpn: "T_pond_server_ok" 
    },
    "T_pond_server_error": {
        eng: "Internal Pond server serror.",
        nmt: "T_pond_server_error",
        jpn: "T_pond_server_error"
    },
    "T_pond_server_unreachable": {
        eng: "Pond server is unreachable.",
        nmt: "T_pond_server_unreachable",
        jpn: "T_pond_server_unreachable"
    },
    "T_pond_server_response_body": {
        eng: "response body:",
        nmt: "T_pond_server_response_body",
        jpn: "T_pond_server_response_body"
    },
    "T_pond_server_response_time {{}}": {
        eng: "response time: {{}} ms",
        nmt: "T_pond_server_response_time {{}}",
        jpn: "T_pond_server_response_time {{}}"
    },
    "T_pond_successful_response_time {{}}": {
        eng: "Successful response: {{}} ms",
        nmt: "T_pond_successful_response_time {{}}",
        jpn: "T_pond_successful_response_time {{}}"
    },
    "T_pond_request_failed {{}} {{}}": {
        eng: "Request failed with status {{}}: {{}}",
        nmt: "T_pond_request_failed {{}} {{}}",
        jpn: "T_pond_request_failed {{}} {{}}"
    },
    "T_pond_average_response_time {{}} {{}}": {
        eng: "Average response time: {{}} ms ({{}}% success rate)",
        nmt: "T_pond_average_response_time {{}} ({{}}% success rate)",
        jpn: "T_pond_average_response_time {{}} ({{}}% success rate)"
    },

    // command help ====================================
    "T_pond_command_help_intro": {
        eng: "* Pond Command Help *",
        nmt: "T_pond_command_help_intro",
        jpn: "T_pond_command_help_intro"
    },
    "T_pond_command_intro_do_h": {
        eng: "Run \"pond -h\" for more information on Pond commands.",
        nmt: "T_pond_command_intro_do_h",
        jpn: "T_pond_command_intro_do_h"
    },
    "T_pond_command_help_login": {
        eng: "pond --login/-l [username] [password] - Log in to your Pond account",
        nmt: "T_pond_command_help_login",
        jpn: "T_pond_command_help_login"
    },
    "T_pond_command_help_register": {
        eng: "pond --register/-r [username] [password] - Register a new Pond account",
        nmt: "T_pond_command_help_register",
        jpn: "T_pond_command_help_register"
    },
    "T_pond_command_help_ping": {
        eng: "pond - Ping the Pond server to check its status",
        nmt: "T_pond_command_help_ping",
        jpn: "T_pond_command_help_ping"
    },
    "T_pond_command_help_test": {
        eng: "pond --test/-t - Run Pond server connectivity tests",
        nmt: "T_pond_command_help_test",
        jpn: "T_pond_command_help_test"
    },
    "T_pond_command_help_u": {
        eng: "pond -u - Use last logged in Pond account (credentials stored locally)",
        nmt: "T_pond_command_help_u",
        jpn: "T_pond_command_help_u"
    },

    // rate limiting ===================================
    "T_pond_ratelimit": {
        eng: "You are being rate limited. Please wait a moment and try again.",
        nmt: "T_pond_ratelimit",
        jpn: "T_pond_ratelimit"
    },
    "T_pond_ratelimit_strict {{}}": {
        eng: "You are being strictly rate limited. Please wait until {{}} to try again.",
        nmt: "T_pond_ratelimit_strict {{}}",
        jpn: "T_pond_ratelimit_strict {{}}"
    },


    // missing input ===================================
    "T_pond_provide_username_password": {
        eng: "Please provide a username and/or password.",
        nmt: "T_pond_provide_username_password",
        jpn: "T_pond_provide_username_password"
    },
    "T_pond_provide_ban_user": {
        eng: "Please provide a username to ban.",
        nmt: "T_pond_provide_ban_user",
        jpn: "T_pond_provide_ban_user"
    },
    "T_pond_provide_user_to_unban": {
        eng: "Please provide a username to unban.",
        nmt: "T_pond_provide_user_to_unban",
        jpn: "T_pond_provide_user_to_unban"
    },
    "T_pond_provide_ban_duration": {
        eng: "Please provide a length for the ban.",
        nmt: "T_pond_provide_ban_duration",
        jpn: "T_pond_provide_ban_duration"
    },
    "T_pond_provide_warn_user": {
        eng: "Please provide a username to warn.",
        nmt: "T_pond_provide_warn_user",
        jpn: "T_pond_provide_warn_user"
    },
    "T_pond_provide_warn_reason": {
        eng: "Please provide a reason for the warning.",
        nmt: "T_pond_provide_warn_reason",
        jpn: "T_pond_provide_warn_reason"
    },



    // invalid (format) ================================
    "T_pond_invalid_name_password": {
        eng: "Invalid username or password.",
        nmt: "T_pond_invalid_name_password",
        jpn: "T_pond_invalid_name_password"
    },
    "T_pond_draft_invalid_format": {
        eng: "Invalid draft format. Must include a recipient, title, and body.",
        nmt: "T_pond_draft_invalid_format",
        jpn: "T_pond_draft_invalid_format"
    },
    "T_pond_invalid_length_format": {
        eng: "Invalid length format. Please use the specified format.",
        nmt: "T_pond_invalid_length_format",
        jpn: "T_pond_invalid_length_format"
    },


    // no permission ===================================
    "T_pond_no_permission_to_ban_user": {
        eng: "You do not have permission to ban this user.",
        nmt: "T_pond_no_permission_to_ban_user",
        jpn: "T_pond_no_permission_to_ban_user"
    },
    "T_pond_no_permission_dismiss_reports": {
        eng: "You do not have permission to dismiss reports.",
        nmt: "T_pond_no_permission_dismiss_reports",
        jpn: "T_pond_no_permission_dismiss_reports"
    },
    "T_pond_no_permission_to_warn_user": {
        eng: "You do not have permission to warn this user.",
        nmt: "T_pond_no_permission_to_warn_user",
        jpn: "T_pond_no_permission_to_warn_user"
    },
    "T_pond_no_permission_to_unban_user": {
        eng: "You do not have permission to unban users.",
        nmt: "T_pond_no_permission_to_unban_user",
        jpn: "T_pond_no_permission_to_unban_user"
    },


    // successes =======================================
    "T_pond_registration_successful": {
        eng: "Registration successful! You can now log in with your credentials. Write your password down, because there is **NO** password recovery.",
        nmt: "T_pond_registration_successful",
        jpn: "T_pond_registration_successful"
    },
    "T_pond_login_successful {{}}": {
        eng: "Login successful! Welcome back {{}}.",
        nmt: "T_pond_login_successful {{}}",
        jpn: "T_pond_login_successful {{}}"
    },
    "T_pond_settings_saved": {
        eng: "Settings saved.",
        nmt: "T_pond_settings_saved",
        jpn: "T_pond_settings_saved"
    },
    "T_pond_appeal_submitted": {
        eng: "Ban appeal submitted.",
        nmt: "T_pond_appeal_submitted",
        jpn: "T_pond_appeal_submitted"
    },

    // failures ========================================
    "T_pond_registration_failed": {
        eng: "Registration failed",
        nmt: "T_pond_registration_failed",
        jpn: "T_pond_registration_failed"
    },
    "T_pond_login_failed": {
        eng: "Login failed.",
        nmt: "T_pond_login_failed",
        jpn: "T_pond_login_failed"
    },
    "T_pond_error_sending_message {{}}": {
        eng: "Failed to send message: {{}}",
        nmt: "T_pond_error_sending_message {{}}",
        jpn: "T_pond_error_sending_message {{}}"
    },
    "T_pond_error_recipient_banned {{}}": {
        eng: "Cannot send message. Recipient '{{}}' is banned.",
        nmt: "T_pond_error_recipient_banned {{}}",
        jpn: "T_pond_error_recipient_banned {{}}"
    },
    "T_pond_inbox_not_found": {
        eng: "The server could not find your user data.",
        nmt: "T_pond_inbox_not_found",
        jpn: "T_pond_inbox_not_found"
    },
    "T_pond_user_not_found": {
        eng: "User not found",
        nmt: "T_pond_user_not_found",
        jpn: "T_pond_user_not_found"
    },
    "T_pond_message_not_found": {
        eng: "Message not found.",
        nmt: "T_pond_message_not_found",
        jpn: "T_pond_message_not_found"
    },
    "T_pond_username_taken": {
        eng: "That username is already taken.",
        nmt: "T_pond_username_taken",
        jpn: "T_pond_username_taken"
    },
    "T_pond_message_too_long": {
        eng: "The message is too long. It must be under 4096 characters.",
        nmt: "T_pond_message_too_long",
        jpn: "T_pond_message_too_long"
    },


    // ban related =====================================
    "T_pond_user_banned": {
        eng: "You are banned from the Pond.",
        nmt: "T_pond_user_banned",
        jpn: "T_pond_user_banned"
    },
    "T_pond_banned_on {{}}": {
        eng: "Banned on: {{}}",
        nmt: "T_pond_banned_on {{}}",
        jpn: "T_pond_banned_on {{}}"
    },
    "T_pond_banned_until {{}}": {
        eng: "Banned until: {{}}",
        nmt: "T_pond_banned_until {{}}",
        jpn: "T_pond_banned_until {{}}"
    },
    "T_pond_ban_reason {{}}": {
        eng: "Reason: {{}}",
        nmt: "T_pond_ban_reason {{}}",
        jpn: "T_pond_ban_reason {{}}"
    },
    "T_pond_ban_permanent": {
        eng: "Permanent",
        nmt: "T_pond_ban_permanent",
        jpn: "T_pond_ban_permanent"
    },
    "T_pond_user_already_banned": {
        eng: "This user is already banned.",
        nmt: "T_pond_user_already_banned",
        jpn: "T_pond_user_already_banned"
    },
    "T_pond_user_not_banned": {
        eng: "This user is not banned.",
        nmt: "T_pond_user_not_banned",
        jpn: "T_pond_user_not_banned"
    },


    // warn related ====================================
    "T_pond_user_warned": {
        eng: "You have been warned!",
        nmt: "T_pond_user_warned",
        jpn: "T_pond_user_warned"
    },
    "T_pond_warned_by {{}}": {
        eng: "You were warned by: {{}}",
        nmt: "T_pond_warned_by {{}}",
        jpn: "T_pond_warned_by {{}}"
    },
    "T_pond_warned_at {{}}": {
        eng: "You were warned at: {{}}",
        nmt: "T_pond_warned_at {{}}",
        jpn: "T_pond_warned_at {{}}"
    },
    "T_pond_warn_reason {{}}": {
        eng: "For the reason of: {{}}",
        nmt: "T_warn_reason {{}}",
        jpn: "T_warn_reason {{}}"
    },
    "T_pond_warn_info_text": {
        eng: "For more information, navigate to 'Other -> Warnings'.",
        nmt: "T_pond_warn_info_text",
        jpn: "T_pond_warn_info_text"
    },


    // session related =================================
    "T_pond_invalid_session": {
        eng: "Invalid session. Please log in again.",
        nmt: "T_pond_invalid_session",
        jpn: "T_pond_invalid_session"
    },
    "T_pond_session_forcefully_terminated": {
        eng: "Your session was forcefully terminated.",
        nmt: "T_pond_session_forcefully_terminated",
        jpn: "T_pond_session_forcefully_terminated"
    },
    "T_pond_session_forcefully_terminated_additional_notes {{}}": {
        eng: "Your session was forcefully terminated. Additional notes: {{}}",
        nmt: "T_pond_session_forcefully_terminated_additional_notes {{}}",
        jpn: "T_pond_session_forcefully_terminated_additional_notes {{}}"
    },
    "T_pond_logged_out": {
        eng: "You have been logged out.",
        nmt: "T_pond_logged_out",
        jpn: "T_pond_logged_out"
    },

    // registration
    "T_pond_registration_statement_1": {
        eng: "By registering, you give The Pond permission to::nl:- store your username:nl:- store your password in an encrypted format:nl:- the repeated permission to store your IP address when you register and log in, for the purposes of IP banning *only*:nl:- abide by the community guidelines",
        nmt: "T_pond_registration_statement_1",
        jpn: "T_pond_registration_statement_1"
    },
    "T_pond_registration_statement_2": {
        eng: "The Pond also reserves the right to::nl:- change these terms at any time without prior notice:nl:- ban and/or warn users who violate the community guidelines or are a general nuisance to the community:nl:- delete accounts that have been inactive for over a year",
        nmt: "T_pond_registration_statement_2",
        jpn: "T_pond_registration_statement_2"
    },
    "T_pond_registration_question": {
        eng: "Do you accept these terms?",
        nmt: "T_pond_registration_question",
        jpn: "T_pond_registration_question"
    },
    "T_pond_registration_cancelled": {
        eng: "Registration cancelled.",
        nmt: "T_pond_registration_cancelled",
        jpn: "T_pond_registration_cancelled"
    },

    // pond end =========================================================================

    // uncategorized messages ==========================
    "T_test {{}} {{}}": {
        eng: "This is a test message with {{}} and {{}}.",
        nmt: "T_test {{}} {{}}",
        jpn: "T_test {{}} {{}}"
    },
};

class UserKey { constructor() {} };

class SwagSystem {
    static diagnostics = {
        writes: {},
        reads: {}
    }
    #fs;
    #functionHashes = ['381bf05bf93fffdf', 'a9dbba03a9ffba87', '9af413c39bf77bcf', '943ee33ffefffb3f', 'c9bf35d4cdffb7df', '12643adc16e67fdc', 'a335c440bf37ee4c', 'd4f8d605d6f9ff8d', '1838f0a69c3bf1af', '1f6906df9ffb4eff', '1a6ccb615e7fef77', 'bfd42740fffd7fca']
    #fullPathHashes = ['c96c0ebfdf7fbfbf', 'e5a770acffff7aaf']

    #cache = new Map();

    hash(inp) {
    function t(k,R){const Q=j();return t=function(m,s){m=m-(-0x212*0x1+0xf3f+0x1*-0xcc5);let Y=Q[m];return Y;},t(k,R);}function F(R,Q,m,s,Y){return t(m-0x112,Q);}(function(R,Q){function I(R,Q,m,s,Y){return t(m-0x2a3,Q);}function W(R,Q,m,s,Y){return t(s-0x398,Y);}function M(R,Q,m,s,Y){return t(Q- -0x261,Y);}function E(R,Q,m,s,Y){return t(Y- -0x21c,R);}function C(R,Q,m,s,Y){return t(R-0x103,Q);}const m=R();while(!![]){try{const s=-parseInt(M(-0x1f0,-0x1f2,-0x1e5,-0x1fb,-0x1f9))/(0x1*0x1933+0xadd+-0x11*0x21f)+parseInt(I(0x304,0x305,0x30d,0x301,0x318))/(0x1*-0x279+-0x60*0x5e+0x25bb)+-parseInt(M(-0x1fa,-0x1ee,-0x1e2,-0x1f1,-0x1e6))/(-0x15ee+0x66d+0xf84)*(-parseInt(M(-0x1f5,-0x1ed,-0x1f5,-0x1f9,-0x1f9))/(-0x1d5e+0x1*-0x15e2+0x3344))+parseInt(M(-0x1de,-0x1e7,-0x1e6,-0x1f0,-0x1f3))/(0x4*0x787+-0x2195*0x1+-0x95*-0x6)*(parseInt(W(0x410,0x41b,0x40f,0x415,0x411))/(-0x54e+0x77c+-0x17*0x18))+-parseInt(C(0x182,0x178,0x178,0x18b,0x186))/(-0x129d+0x26b3*0x1+-0x140f)+parseInt(C(0x175,0x16c,0x182,0x178,0x181))/(-0x6ae+-0x1a83*0x1+0xf*0x237)+-parseInt(M(-0x1e3,-0x1f0,-0x1eb,-0x1e5,-0x1f2))/(-0x67*0x1c+-0x4f9+-0x823*-0x2)*(-parseInt(C(0x171,0x16f,0x16a,0x17b,0x16f))/(-0x17e6+-0xed4+0x2*0x1362));if(s===Q)break;else m['push'](m['shift']());}catch(Y){m['push'](m['shift']());}}}(j,0x4cc21*-0x2+0xdabdb+0x382d2),inp=inp[F(0x186,0x185,0x190,0x19d,0x197)+c(-0x1a5,-0x1b1,-0x1a1,-0x1a6,-0x1a8)](/\n|\r/g,''));function c(R,Q,m,s,Y){return t(R- -0x21c,Y);}function j(){const Z=['\x76\x62\x56\x77\x62','\x63\x65\x41\x6c\x6c','\x6d\x6b\x78\x69\x70','\x72\x65\x76\x65\x72','\x32\x30\x43\x68\x54\x65\x57\x7a','\x47\x4b\x4d\x75\x66','\x74\x72\x69\x6d','\x33\x34\x36\x35\x36\x30\x70\x56\x6b\x7a\x64\x46','\x72\x65\x70\x6c\x61','\x34\x36\x30\x33\x32\x31\x34\x77\x58\x53\x57\x7a\x74','\x4b\x48\x57\x7a\x69','\x49\x64\x46\x49\x6a','\x6a\x6f\x69\x6e','\x6c\x65\x6e\x67\x74','\x31\x33\x31\x31\x32\x33\x32\x52\x73\x6b\x66\x68\x44','\x4e\x66\x4a\x4a\x47','\x69\x44\x41\x6b\x73','\x73\x70\x6c\x69\x74','\x31\x30\x4d\x5a\x7a\x42\x69\x4b','\x36\x38\x36\x37\x30\x31\x63\x65\x49\x6c\x45\x62','\x74\x6f\x53\x74\x72','\x37\x33\x39\x31\x37\x42\x4a\x6e\x48\x77\x4b','\x34\x36\x36\x32\x31\x39\x32\x45\x54\x41\x57\x53\x74','\x33\x4d\x48\x61\x59\x79\x75','\x31\x34\x35\x35\x36\x37\x36\x62\x67\x54\x66\x73\x75','\x69\x6e\x67'];j=function(){return Z;};return j();}let k=()=>{const R={'\x49\x64\x46\x49\x6a':function(x,e,B){return x(e,B);},'\x4e\x66\x4a\x4a\x47':function(x,e){return x(e);},'\x6d\x6b\x78\x69\x70':function(x,e){return x(e);},'\x69\x44\x41\x6b\x73':function(e,B){return e>>>B;},'\x4b\x48\x57\x7a\x69':function(e,B){return e+B;},'\x47\x4b\x4d\x75\x66':function(e,B){return e^B;},'\x76\x62\x56\x77\x62':function(e,B){return e&B;}},Q=x=>x[N(-0x239,-0x242,-0x234,-0x23b,-0x239)+'\x63\x65'](/\r\n|\r/g,'\x0a')[p(-0x25b,-0x26a,-0x267,-0x26d,-0x26d)+'\x63\x65'](/\/\/.*$/gm,'')[r(0x39e,0x392,0x39f,0x397,0x39b)+'\x63\x65'](/\/\*[\s\S]*?\*\//g,'')[p(-0x263,-0x264,-0x267,-0x267,-0x267)+'\x63\x65'](/\s+/g,'\x20')[N(-0x23e,-0x23c,-0x235,-0x246,-0x239)+'\x63\x65'](/\s*([{}();,:=+\-*/<>])\s*/g,'\x24\x31')[p(-0x261,-0x262,-0x269,-0x270,-0x272)]();function N(R,Q,m,s,Y){return c(Y- -0x9b,Q-0x94,m-0x13f,s-0x1b5,s);}function r(R,Q,m,s,Y){return c(s-0x535,Q-0x13e,m-0x9c,s-0x3c,Q);}const m=R[p(-0x26a,-0x26f,-0x264,-0x268,-0x25e)](murmurhash3_32_gc,R[N(-0x256,-0x251,-0x24f,-0x242,-0x24c)](Q,inp),inp[A(-0xc,-0x20,-0x1e,-0x14,-0x19)+'\x68']),s=R[u(-0x175,-0x172,-0x17f,-0x17d,-0x179)](murmurhash3_32_gc,R[A(-0xe,-0x6,0x1,-0x4,-0xa)](Q,inp)[u(-0x193,-0x18e,-0x19e,-0x191,-0x19a)]('')[N(-0x232,-0x24b,-0x236,-0x245,-0x23e)+'\x73\x65']()[r(0x37b,0x375,0x389,0x381,0x37b)](''),inp[N(-0x244,-0x249,-0x248,-0x241,-0x24e)+'\x68']);function A(R,Q,m,s,Y){return c(Y-0x19a,Q-0xb9,m-0x16e,s-0x13e,R);}function p(R,Q,m,s,Y){return F(R-0x2a,Y,m- -0x3f7,s-0x186,Y-0xb3);}function u(R,Q,m,s,Y){return F(R-0x9b,Q,s- -0x310,s-0x15a,Y-0xb6);}const Y=R[r(0x38e,0x390,0x383,0x385,0x379)](R[u(-0x182,-0x171,-0x179,-0x17e,-0x177)](R[N(-0x23d,-0x240,-0x249,-0x247,-0x23c)](m,s),R[r(0x385,0x394,0x387,0x38f,0x388)](m,s)),0x1207+0x2543*-0x1+-0x133c*-0x1);return R[A(0x0,0x9,-0x9,0x5,-0x2)](m[N(-0x241,-0x245,-0x249,-0x23d,-0x247)+r(0x385,0x39b,0x388,0x38e,0x392)](0x10ad+0x11d8+-0x2275),Y[N(-0x246,-0x242,-0x23f,-0x247,-0x247)+A(-0x9,-0x15,-0x16,-0x9,-0xd)](0x1439+0x207+0x1*-0x1630));};return k();
    }


    /**
     * 
     * @param {{string:FroggyFile[]}} data - file system data
     */
    constructor(data) {
        for(let directoryName in data){
            let dir = data[directoryName];
            dir.forEach((file, i) => {
                data[directoryName][i] = new FroggyFile(file.name, file.properties, file.data, directoryName);
            })
        }

        this.#fs = data
    }

    // verifyMethod(method) {
    //     let stack = new Error().stack.split("\n");
    //     if(!stack[2].trim().startsWith("at Method.ffsProxy")) throw new Error(`You may not use verifyMethod() directly. You must use method.ffsProxy() instead.`); 
    //     let id = method.getId();

    //     //if (!this.#methodHashes.includes(id)) throw new Error(`Access denied: Method "${method.name}" is not allowed to access the file system.`);
    //     return this;
    // }

    #verify() {
        return;
        let stack = new Error().stack.split("\n");

        const caller = stack[stack.length - 2].trim().match(/at (.+?) \(/)[1];

        // function verification
        // if any index of the stack has <anonymous> in it, it means the function is anonymous and we should not allow file system access
        if (stack.some(line => line.includes("at <anonymous>"))) throw new Error(`HAHA! NICE TRY! No.`);

        let returnEarly = false;

        try {
            if(eval(caller) === undefined && caller.startsWith("fs.")) return;
        } catch {
            function getFullPathStack(_0x_stk){
                try{
                    var _0x_clone = typeof structuredClone === "function" ? structuredClone(_0x_stk) : JSON.parse(JSON.stringify(_0x_stk));
                }catch(_0xe){ var _0x_clone = JSON.parse(JSON.stringify(_0x_stk)); }
                (function(_0xa){
                    Array.prototype.shift.call(_0xa);
                }(_0x_clone));
                var _0x_joiner = String.fromCharCode(32,45,62,32); // " -> "
                return Array.prototype.map.call(_0x_clone, function(_0y){
                    return ("" + _0y).replace(/^\s+|\s+$/g, "").replace(/\s*\(.*?\)$/, "");
                }).join(_0x_joiner);
            }

            const fullPathCaller = getFullPathStack(stack);

            const fullPathHash = this.#cache.get(fullPathCaller) ?? this.hash(fullPathCaller);

            if(this.#cache.get(fullPathCaller) === undefined) this.#cache.set(fullPathCaller, fullPathHash);

            returnEarly = true;

            if (!this.#fullPathHashes.includes(fullPathHash)) throw new Error(`Access denied: You may not access the file system through this method.`);
        }

        if(returnEarly) return;

        try { eval(caller) } catch (e) { throw new Error(`Access denied: You may not access the file system through an anonymous arrow function.`) }

        if(eval(caller) == undefined) throw new Error(`Access denied: You may not access the file system through an anonymous arrow function.`);

        const callerHash = this.#cache.get(eval(caller).toString()) ?? this.hash(eval(caller).toString());

        if(this.#cache.get(eval(caller).toString()) === undefined) this.#cache.set(eval(caller).toString(), callerHash);

        if (!this.#functionHashes.includes(callerHash)) throw new Error(`Access denied: JavaScript Function "${caller}" is not allowed to access the file system.`);
    }

    size() {
        this.#verify();
        let total = 0;
        const fs = this.#fs;
        for (let directory in fs) {
            total += directory.length;
            fs[directory].forEach(file => {
                total += file.getSize();
            });
        }

        return formatBytes(total);
    }

    getDirectory(location) {
        this.#verify();
        const fs = this.#fs;

        return fs[location]?.filter(f => f.getProperty("hidden") !== true) || undefined;
    }

    directoryExists(location) {
        this.#verify();
        const fs = this.#fs;
        return fs[location] !== undefined;
    }

    /**
     * 
     * @param {string} fullPath 
     * @returns {FroggyFile}
     */
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

    /**
     * 
     * @param {String} location - directory path
     * @param {FroggyFile} file - FroggyFile instance
     * @returns {void|undefined}
     */
    addFileToDirectory(location, file) {
        this.#verify();
        const fs = this.#fs;

        if(fs[location] === undefined) return undefined;
        if(fs[location]?.find(f => f.getName() === file.getName())) return undefined;
        file.dirname = location;
        this.#fs[location].push(file);
    }

    getRoot() {
        this.#verify();
        return this.#fs;
    }

    currentDrive() {
        return config.currentPath.split(":")[0];
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

    fileExists(fullPath) {
        this.#verify();
        let fp = fullPath.split("/");
        let path = fp.slice(0, -1).join("/");
        let file = fp[fp.length - 1];
        const fs = this.#fs;
        if(fs[path] === undefined) return false;

        let retrievedFile = fs[path]?.find(f => f.getName() === file);
        return retrievedFile !== undefined && retrievedFile.getProperty("hidden") !== true;
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
        this.#fs = {};
        try {
            let parsedData = JSON.parse(data);
            for(let directoryName in parsedData){
                let dir = parsedData[directoryName];
                this.createDirectory(directoryName);
                dir.forEach(file => {
                    this.addFileToDirectory(directoryName, FroggyFile.from(file));
                })
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
    #size
    static filePropertyDefaults = {
        transparent: false,
        read: true,
        write: true,
        hidden: false
    }

    /**
     * @param {{name: String, properties: FroggyFile.filePropertyDefaults, data: String[]}} object 
     * @returns {FroggyFile}
     */
    static from(object) {
        let file = new FroggyFile(object.name, object.properties, object.data);
        return file;
    }

    /**
     * 
     * @param {String} name
     * @param {FroggyFile.filePropertyDefaults} properties
     * @param {String[]} data
     */
    constructor(name, properties = FroggyFile.filePropertyDefaults, data = [""], dirname = "<unknown dir>") {
        this.#name = name;
        this.#properties = properties;
        this.#data = data;
        this.#size = 4;
        this.dirname = dirname;
        data.forEach(line => {
            this.#size += line.length + 1;
        });
        this.#size += this.#name.length;
    }

    /**
     * 
     * @param {string} newName 
     */
    rename(newName){
        if(this.#name === "trusted_programs") throw new Error("You may not rename the 'trusted_programs' file.");
        this.#size -= this.#name.length;
        this.#name = newName;
        this.#size += this.#name.length;
    }

    /**
     * @returns {{name: String, properties: FroggyFile.filePropertyDefaults, data: String[]}}
     */
    toJSON(){
        return {
            name: this.#name,
            properties: this.#properties,
            data: this.#data
        };
    }

    /**
     * 
     * @param {String[]} data 
     */
    write(data) {
        this.#data = data;
        this.#size = 4;
        const loc = this.dirname + "/" + this.#name;
        if(!SwagSystem.diagnostics.writes[loc]) SwagSystem.diagnostics.writes[loc] = {};

        if(!SwagSystem.diagnostics.writes[loc].total) {
            SwagSystem.diagnostics.writes[loc].total = 0;
            SwagSystem.diagnostics.writes[loc].perSec = 0;
        }

        SwagSystem.diagnostics.writes[loc].total = (SwagSystem.diagnostics.writes[loc].total || 0) + 1;
        data.forEach(line => {
            this.#size += line.length + 1;
        });
        this.#size += this.#name.length;
    }

    /**
     * 
     * @returns {String[]}
     */
    getData() {
        const loc = this.dirname + "/" + this.#name;
        if(!SwagSystem.diagnostics.reads[loc]) SwagSystem.diagnostics.reads[loc] = {};

        if(!SwagSystem.diagnostics.reads[loc].total) {
            SwagSystem.diagnostics.reads[loc].total = 0;
            SwagSystem.diagnostics.reads[loc].perSec = 0;
        }
        SwagSystem.diagnostics.reads[loc].total = (SwagSystem.diagnostics.reads[loc].total || 0) + 1;
        return this.#data;
    }

    /**
     * 
     * @returns {String}
     */
    getName() {
        return this.#name;
    }

    /**
     * 
     * @returns {{transparent: boolean, read: boolean, write: boolean, hidden: boolean}}
     */
    getProperties() {
        return this.#properties;
    }

    /**
     * 
     * @param {String} name 
     * @returns {Boolean}
     */
    getProperty(name) {
        return this.#properties[name];
    }

    /**
     * 
     * @returns {Number}
     */
    getSize() {
        return this.#size;
    }

    /**
     * 
     * @param {String} name 
     * @param {Boolean} value 
     * @returns {void|undefined}
     */
    setProperty(name, value) {
        if(this.#name === "trusted_programs") throw new Error("You may not set properties on the 'trusted_programs' file.");
        if (this.#properties[name] !== undefined) {
            this.#properties[name] = value;
        } else return undefined;
    }
}

const FroggyFileSystem = new SwagSystem({
    "Config:": [
        { name: "trusted_programs", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "test",
            "fs3help",
            "confirm"
        ] },
        { name: "user", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "KEY language TYPE String VALUE eng END",
            "KEY colorPalette TYPE String VALUE standard END",
            "KEY version TYPE String VALUE 1.17-indev END",
            "KEY showSpinner TYPE Boolean VALUE false END",
            "KEY currentSpinner TYPE String VALUE default END",
            "KEY defaultSpinner TYPE String VALUE default END",
            "KEY timeFormat TYPE String VALUE w. Y/mn/d h:m:s END",
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
            "5 TYPE String VALUE D:/Pond",
            "KEY dissallowSubdirectoriesIn TYPE Array END",
            "KEY validateLanguageOnStartup TYPE Boolean VALUE true END",
        ] },
    ],
    "Config:/langs": [
        { name: "ldm", properties: {transparent: true,  read: true, write: true, hidden: false}, data: [] },
        { name: "eng", properties: {transparent: false, read: true, write: true, hidden: false}, data: [] },
        { name: "nmt", properties: {transparent: false, read: true, write: true, hidden: false}, data: [] },
        { name: "jpn", properties: {transparent: false, read: true, write: true, hidden: false}, data: [] },
    ],
    "Config:/program_data": [],
    "C:": [],
    "C:/Home": [
        { name: "welcome", properties: {transparent: false, read: true, write: true, hidden: false}, data: ['Hello!', "Welcome to FroggyOS.", "Type 'help' for a list of commands.", "Have fun! ^v^"] },
    ],
    "C:/Docs": [],
    "D:": [], 
    "D:/Pond": [],
    "D:/Pond/drafts": [],
    "D:/Pond/sent": [],
    "D:/Pond/secret": [
        { name: sessionTokenFile, properties: {transparent: true, read: true, write: true, hidden: false}, data: [""] },
        { name: credentialFile, properties: {transparent: true, read: true, write: true, hidden: false}, data: [""] }
    ],
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
            // "var object = {",
            // "    'name' = 'froggyOS'",
            // "    'version' = '1.17-indev'",
            // "    'meow' = {",
            // "        'name' = 'woof'",
            // "    }",
            // "}",
            // "out 10 + 'meow'",
            // // "var meow = {",
            // // "    'name' = 'meow'",
            // // "}",
            "translate_out 'T_hello_froggy'",
            // "if :1: {",
            // "    try {",
            // "       out notAVariable",
            // "    }",
            // "    catch {",
            // "       out 'An error occured: ' + __error__.'message'",
            // "        quietkill",
            // "    }",
            // "}",
            // "out 'what.'"
            // "out 'meow'",
            // "wait 10000",
            // "out 'wa'",
            // "wait 1000",
            // "out 'agaga'",
            // "wait 500",
            // "out 'gagagaga'",
        ] },
        { name: "terminal_confirm", properties: {transparent: true, read: true, write: false, hidden: false}, data: [
            "import 'filesys'",
            "writeProgramData 'confirmed' 0",
            "var question = ''",
            "var yes = ''",
            "var no = ''",
            "var response = ''",
            "var answer_for_decline = ''",
            "filearg $question 1",
            "filearg $yes 2",
            "filearg $no 3",
            "filearg $answer_for_decline 4",
            "out question",
            "prompt $response 1 [yes, no]",
            "if response>eq(yes) {",
            "    writeProgramData 'confirmed' 1",
            "}",
            "else {",
            "    writeProgramData 'confirmed' 0",
            "    if answer_for_decline>neq('') {",
            "        out answer_for_decline",
            "    }",
            "}",
        ] },
            { name: "fs3help", properties: {transparent: false, read: true, write: false, hidden: false }, data: [
                "out ''",
                "out 'FroggyScript3 Help Program'",
                "var command = ''",
                "cvar commandObject = {",
                "    'var' = {",
                "        'description' = 'Used to declare a variable.'",
                "        'usage' = 'var [variable] = [string|number|array|block (object)]'",
                "        'example' = 'var myVar = 10'",
                "        'note' = 'Some imports may add additional types that can be assigned to variables. See object syntax in official docs.'",
                "    }",
                "    'cvar' = {",
                "        'description' = 'Used to declare a constant variable (cannot be reassigned after declaration).'",
                "        'usage' = 'cvar [variable] = [string|number|array|block (object)]'",
                "        'example' = 'cvar myConstVar = 20'",
                "        'note' = 'Some imports may add additional types that can be assigned to constant variables. See object syntax in official docs.'",
                "    }",
                "    'set' = {",
                "        'description' = 'Used to assign a new value to an existing variable.'",
                "        'usage' = 'set $[variable] = [string|number|array|block (object)]'",
                "        'example' = 'set $myVar = 15'",
                "        'note' = 'Some imports may add additional types that can be assigned to variables. See object syntax in official docs.'",
                "    }",
                "    'arrset' = {",
                "        'description' = 'Used to set a value at a specific index in an array.'",
                "        'usage' = 'arrset $[array] [index] = [string|number|array|block (object)]'",
                "        'example' = 'arrset $myArray 0 = \"newValue\"'",
                "        'note' = 'Some imports may add additional types that can be assigned to arrays. See object syntax in official docs.'",
                "    }",
                "    'free' = {",
                "        'description' = 'Frees up memory by deleting a variable. Some variables cannot be deleted, such as constants.'",
                "        'usage' = 'free $[variable]'",
                "        'example' = 'free $myVar'",
                "    }",
                "    'out' = {",
                "        'description' = 'Outputs text to the terminal.'",
                "        'usage' = 'out [string|number]'",
                "        'example' = 'out \"Hello, World!\"'",
                "    }",
                "    'translate_out' = {",
                "        'description' = 'Outputs translated text to the terminal based on the current language setting.'",
                "        'usage' = 'translate_out [translationDescriptor]'",
                "        'example' = 'translate_out \"T_hello_froggy\"'",
                "    }",
                "    'ask' = {",
                "        'description' = 'Prompts the user for input and stores it in a variable.'",
                "        'usage' = 'ask $[variable] [promptText]'",
                "        'example' = 'ask $userName \"Enter your name: \"'",
                "    }",
                "    'prompt' = {",
                "        'description' = 'Displays a list of options for the user to choose from and stores the selected option in a variable.'",
                "        'usage' = 'prompt $[variable] [defaultIndex] [arrayOfOptions]'",
                "        'example' = 'prompt $colorChoice 0 [\"Red\", \"Green\", \"Blue\"]'",
                "    }",
                "    'filearg' = {",
                "        'description' = 'Retrieves a command-line argument passed to the script. The 0th argument is the script name, while subsequent arguments are the passed arguments. If an argument does not exist, the variable is not modified.'",
                "        'usage' = 'filearg $[variable] [argumentIndex]'",
                "        'example' = 'filearg $firstArg 1'",
                "    }",
                "    'kill' = {",
                "        'description' = 'Terminates the program immediately by raising a RuntimeError.'",
                "        'usage' = 'kill'",
                "        'example' = 'kill'",
                "    }",
                "    'quietkill' = {",
                "        'description' = 'Terminates the program immediately without raising an error. The program must be trusted to use this command.'",
                "        'usage' = 'quietkill'",
                "        'example' = 'quietkill'",
                "    }",
                "    'if' = {",
                "        'description' = 'Begins a conditional block that executes code if the specified condition is true.'",
                "        'usage' = 'if [condition_statement] [block]'",
                "        'example' = 'if :myVar > 10: { `n               out \"myVar is greater than 10\" `n           }'",
                "    }",
                "    'loop' = {",
                "        'description' = 'Creates a loop that repeats a block of code a specified number of times or while a condition is true.'",
                "        'usage' = 'loop [number|condition_statement] [block]'",
                "        'example' = 'var counter = 0`n           loop :counter < 5: { `n               out counter `n               set $counter = counter>inc `n           }'",
                "    }",
                "    'foreach' = {",
                "        'description' = 'Iterates over each element in an array, executing a block of code for each element. The current element is accessible using the special variable __item__ within the block, and the index of the current element is accessible using __index__.'",
                "        'usage' = 'foreach $[array] [block]'",
                "        'example' = 'var myArray = [\"apple\", \"banana\", \"cherry\"]`n           foreach $myArray { `n               out \"Item \" + __index__>toString + \": \" + __item__ `n           }'",
                "        'note' = 'The >toString method is being used because the + operator sometimes does not convert types properly.'",
                "    }",
                "    'try' = {",
                "        'description' = 'Begins a block of code that will attempt to execute. If an error occurs within the block, control is passed to the catch block. Try-Catch blocks ignore SecurityErrors.'",
                "        'usage' = 'try [block]'",
                "        'example' = 'try { `n               out notAVariable `n           }'",
                "    }",
                "    'catch' = {",
                "        'description' = 'Begins a block of code that executes if an error occurs in the preceding try block. The special variable __error__ contains information about the error that occurred. Try-Catch blocks ignore SecurityErrors. The error object has the properties \"type\", \"message\", and \"line\", and \"col\".'",
                "        'usage' = 'catch [block]'",
                `        'example' = 'catch { \`n               out \"An error occured: \" + __error__.\"message\" \`n           }'`,
                "    }",
                "    'skip' = {",
                "        'description' = 'Ends the current block.'",
                "        'usage' = 'skip'",
                "        'example' = 'if :true: { `n               out \"Hello, World!\" `n               skip `n               out \"This will never be printed.\" `n           }'",
                "    }",
                "    'break' = {",
                "        'description' = 'Exits the current loop.'",
                "        'usage' = 'break'",
                "        'example' = 'loop :true: { `n               out \"This will print once.\" `n               break `n               out \"This will never be printed.\" `n           }'",
                "    }",
                "    'continue' = {",
                "        'description' = 'Skips the rest of the current loop iteration and begins the next iteration.'",
                "        'usage' = 'continue'",
                "        'example' = 'loop 5 { `n               out \"This will print 5 times.\" `n               continue `n               out \"This will never be printed.\" `n           }'",
                "    }",
                "    'exit' = {",
                "        'description' = 'Immediately exits the current function.'",
                "        'usage' = 'exit'",
                "        'example' = 'func @myFunction { `n               out \"This will print.\" `n               exit `n               out \"This will never be printed.\" `n           }'",
                "    }",
                "    'func' = {",
                "        'description' = 'Declares a non-parameterized function that can be called later in the program.'",
                "        'usage' = 'func @[functionName] [block]'",
                "        'example' = 'func @myFunction { `n               out \"Hello from myFunction!\" `n           }'",
                "    }",
                "    'call' = {",
                "        'description' = 'Calls a non-parameterized function that has been previously declared.'",
                "        'usage' = 'call @[functionName]'",
                "        'example' = 'call @myFunction'",
                "    }",
                "    'pfunc' = {",
                "        'description' = 'Declares a parameterized function that can accept arguments when called. Parameters are defined by strings, in the format \"parameterName:TYPE\". Supported types are S (string), N (number), and A (array).'",
                `        'usage' = 'pfunc @[functionName] ["param1:type1", ...] [block]'`,
                "        'example' = 'pfunc @greet [\"name:S\"] { `n               out \"Hello, \" + name `n           }'",
                "    }",
                "    'pcall' = {",
                "        'description' = 'Calls a parameterized function that has been previously declared, passing the specified arguments to the function in the array.'",
                "        'usage' = 'pcall @[functionName] [arrayOfArguments]'",
                "        'example' = 'pcall @greet [\"Alice\"]'",
                "    }",
                "    'return' = {",
                "        'description' = 'Returns a value from a function. This value is stored in the fReturn variable. return does NOT end the function early.'",
                "        'usage' = 'return [string|number|array|block (object)]'",
                "        'example' = 'func @add [\"a:N\", \"b:N\"] { `n               return a>add(b) `n           }'",
                "        'note' = 'Some imports may add additional types that can be returned from functions. See object syntax in official docs.'",
                "    }",
                "    'import' = {",
                "        'description' = 'Imports a FroggyScript3 module, making its functions and variables available for use in the current program. Current modules are: math, keyboard, graphics.'",
                "        'usage' = 'import [string]'",
                "        'example' = 'import \"math\"'",
                "    }",
                "}",
                "filearg $command 1",
                "if command>neq('') {",
                "    try {",
                "        out 'Selected command: ' + command",
                "        out '~'>repeat(77)",
                "        out 'Description: `n           ' + commandObject.command.'description'",
                "        out ''",
                "        out '      Usage: `n           ' + commandObject.command.'usage'",
                "        out ''",
                "        out '    Example: `n           ' + commandObject.command.'example'",
                "    }",
                "    catch {",
                "        out ''",
                "        out 'No help available for command: ' + command",
                "        out 'Available commands:'",
                "        out commandObject>keys>join(', ')",
                "        quietkill",
                "    }",
                "    try {",
                "        out '`n       Note:`n           ' + commandObject.command.'note'",
                "    }",
                "    out '~'>repeat(77)",
                "    quietkill",
                "}",
                "# no command specified",
                "out 'This is the help program for FroggyScript3, the scripting language used in FroggyOS.'",
                "out 'To get help on a specific command, run \"fs3help [command]\"'",
                "out 'Visit the documentation (docs command) to get more detailed information.'",
                "out 'Available commands:'",
                "out commandObject>keys>join(', ')",
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
            "        set $appleX = applesX>index(__index__)",
            "        set $appleY = applesY>index(__index__)",
            "        if :headX == appleX & headY == appleY: {",
            "            set $ate = true",
            "            set $score = score>inc",
            "            set $applesX = applesX>splice(__index__, 1)",
            "            set $applesY = applesY>splice(__index__, 1)",
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
            "            set $snakeXDraw = snakeX>index(__index__)",
            "            set $snakeYDraw = snakeY>index(__index__)",
            "            if :snakeYDraw == drawY: {",
            "                set $row = row>replaceAt(snakeXDraw, '#')", 
            "            }",
            "            set $dudX = snakeX>length>dec",
            "            if :(__index__ < dudX) & headX == snakeXDraw & headY == snakeYDraw: {",
            "                set $collision = true",
            "            }",
            "        }",

            "        loop applesX>length {",
            "            set $appleX = applesX>index(__index__)",
            "            set $appleY = applesY>index(__index__)",
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
            "        out 'Game Over! Final Score: '>concat(score>s)",
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
        { name: "set-froggy-time-format", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "!f",
            "ft w. Y/mn/d h:m:s",
        ] },
        { name: "set-US-time-format", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "!time-US",
            "ft w. mn/d/y H:m:s a",
        ] },
        { name: "set-EU-time-format", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "!time-EU",
            "ft w. d/mn/y H:m:s",
        ] },
        { name: "set-iso-time-format", properties: {transparent: false, read: true, write: true, hidden: false}, data: [
            "!time-ISO",
            "ft Y-mn-d!T h:m:s.l!Z",
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
            "error-text 15",
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
        ] },
        { name: "unsaved", properties: {transparent: true, read: true, write: true, hidden: false}, data: [
            "*"
        ] },
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
    currentPath: "C:/Home",
    commandHistory: [],
    commandHistoryIndex: 0,
    spinnerIndex: 0,
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

const diagnostics = {
    total: {
        configRead: 0,
        configWrite: 0,
    },
    runtime: 0,
    startTime: Date.now(),
    counter: 0,
}

const config = new Proxy(config_preproxy, {
    get: (target, prop, value) => {
        diagnostics.total.configRead++;
        return target[prop];
    },
    set: (target, prop, value) => {
        diagnostics.total.configWrite++;
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

// Store previous totals
let prevTotals = {
    configRead: 0,
    configWrite: 0,
    reads: {},
    writes: {}
};

const diagnosticsGovernor = new Governor("diagnostics", 1000, () => {
    diagnostics.counter++; // increment counter for this tick
    const now = Date.now();
    diagnostics.runtime = now - diagnostics.startTime;

    // Initialize containers
    diagnostics.lastSecond = {};
    diagnostics.average = {};

    // --- Config GET/SET ---
    ['configRead', 'configWrite'].forEach(key => {
        const current = diagnostics.total[key] || 0;
        const delta = current - (prevTotals[key] || 0);
        diagnostics.lastSecond[key] = delta;
        diagnostics.average[key] = +(current / diagnostics.counter).toFixed(2); // average per interval
        prevTotals[key] = current;
    });

    // --- Reads & Writes ---
    ['reads', 'writes'].forEach(type => {
        diagnostics.lastSecond[type] = {};
        diagnostics.average[type] = {};

        for (let dir in SwagSystem.diagnostics[type]) {
            const total = SwagSystem.diagnostics[type][dir].total || 0;
            if (!(dir in prevTotals[type])) prevTotals[type][dir] = 0;

            const delta = total - prevTotals[type][dir];
            const avg = +(total / diagnostics.counter).toFixed(2); // average per interval

            diagnostics.lastSecond[type][dir] = delta;
            diagnostics.average[type][dir] = avg;

            prevTotals[type][dir] = total;
        }
    });
});

// TroubleManager.registerGovernor("diagnostics", diagnosticsGovernor);

// config.intervals[diagnosticsGovernor] = true
// config.intervalNameMap[diagnosticsGovernor] = "diagnostics";

function outputDiagnosticInformation(){
    // --- Console Output ---
    console.clear();
    console.log(`--- Diagnostics (Runtime: ${(diagnostics.runtime/1000).toFixed(2)}s) ---`);

    // Config table
    console.log("Config:");

    const configTable = ['configRead', 'configWrite'].map(k => ({
        Metric: k,
        'Last Second': diagnostics.lastSecond[k],
        'Average': diagnostics.average[k],
        'Total': diagnostics.total[k]
    }));
    console.table(configTable);

    // Reads/Writes tables
    ['reads', 'writes'].forEach(type => {
        console.log(type.charAt(0).toUpperCase() + type.slice(1) + ":");
        const table = [];
        for (let dir in diagnostics.lastSecond[type]) {
            table.push({
                Directory: dir,
                'Last Second': diagnostics.lastSecond[type][dir],
                'Average': diagnostics.average[type][dir],
                'Total': SwagSystem.diagnostics[type][dir].total
            });
        }
        console.table(table);
    });
}

function formatBytes(total) {
    if (total < 1024) {
        // B → KB
        return `${total} B`;
    }
    else if (total < 1024 * 1024) {
        const kb = total / 1024;
        return `${kb.toFixed(2)} KB (${total} B)`;
    }
    else if (total < 1024 * 1024 * 1024) {
        const kb = total / 1024;
        const mb = total / (1024 * 1024);
        return `${mb.toFixed(2)} MB (${kb} KB)`;
    }
    else {
        const mb = total / (1024 * 1024);
        const gb = total / (1024 * 1024 * 1024);
        return `${gb.toFixed(2)} GB (${mb} MB)`;
        // TB preview uses more precision (usually very small)
    }
}

const user_config_keys = Object.keys(config_preproxy).filter(key => config_preproxy[key] instanceof UserKey);
const os_config_keys = Object.keys(config_preproxy).filter(key => !(config_preproxy[key] instanceof UserKey)).filter(key => !["trustedPrograms"].includes(key));

const setLanguageFiles = () => {
    let langs = {};

    // 1. Initialize language arrays based on actual files
    const langFiles = FroggyFileSystem.getDirectory("Config:/langs");
    langFiles.forEach(file => {
        langs[file.getName()] = [];
    });

    // 2. Dynamically fill each list based on presetLanguagesMap
    Object.keys(presetLanguagesMap).forEach(key => {
        const data = presetLanguagesMap[key];

        // For every file/language, check if the key exists in the preset entry
        Object.keys(langs).forEach(langName => {
            if (data?.[langName] != null) {
                langs[langName].push(data[langName]);
            } else {
                // Optionally push the key itself if the file is meant to store languages
                // Example: if "ldm" file is supposed to store the keys
                if (langName === "ldm") langs.ldm.push(key);
            }
        });
    });

    // 3. Write results back to each file
    langFiles.forEach(file => {
        file.write(langs[file.getName()]);
    });
};

setLanguageFiles();