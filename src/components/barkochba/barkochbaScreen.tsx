import {
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    SwipeableDrawer,
    Button,
    Box,
    Skeleton,
} from "@mui/material";
import { PersonsSelector } from "./personsSelector";
import { ISelectOption } from "../../commons";
import {
    selectCurrentListeningPersonsAsSelectOptions,
    selectPersonsAsSelectOptions,
    setCurrentListeningPersonIds,
    selectBarkochbaDrawerIsOpen,
    setBarkochbaDrawerIsOpen,
    selectHasViewerRole,
    selectIsAllDataLoaded,
} from "../../store";
import { useDispatch, useSelector } from "react-redux";
import { StoryPanel } from "./storyPanel";
import { ListeningCampRoomSelector } from "./listeningCampRoomSelector";
import { BarkochbaDrawer } from "./barkochbaDrawer";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import MenuIcon from "@mui/icons-material/Menu";
import css from "./barkochbaScreen.module.scss";

export function BarkochbaScreen() {
    const dispatch = useDispatch();
    const barkochbaDrawerIsOpen = useSelector(selectBarkochbaDrawerIsOpen);
    const currentListeningPersonsAsSelectOptions = useSelector(selectCurrentListeningPersonsAsSelectOptions);
    const personsAsSelectOptions = useSelector(selectPersonsAsSelectOptions);
    const hasViewerRole = useSelector(selectHasViewerRole);
    const isAllDataLoaded = useSelector(selectIsAllDataLoaded);

    const selectedPeopleNumber = currentListeningPersonsAsSelectOptions.length;
    const personSelectorTitle = `Nekik mesélek${
        selectedPeopleNumber === 0 ? "" : ` (${selectedPeopleNumber} gyerek)`
    }`;

    const handleCurrentListeningPersonsChange = (values: ISelectOption[]) => {
        const personIds = values.map((value) => value.value);
        dispatch(setCurrentListeningPersonIds({ currentListeningPersonIds: personIds }));
    };

    const handleDrawerOpen = () => {
        dispatch(setBarkochbaDrawerIsOpen({ barkochbaDrawerIsOpen: true }));
    };

    const handleDrawerClose = () => {
        dispatch(setBarkochbaDrawerIsOpen({ barkochbaDrawerIsOpen: false }));
    };

    const handleDrawerToggle = () => {
        dispatch(setBarkochbaDrawerIsOpen({ barkochbaDrawerIsOpen: !barkochbaDrawerIsOpen }));
    };

    if (hasViewerRole === false) {
        return (
            <Box className={css.barkochbaScreen} sx={{ padding: 5 }}>
                <Typography variant="h5" align="center">
                    Nincs hozzáférésed az apphoz. Ahhoz, hogy hozzáférést kapj, írd meg egy illetékesnek az e-mail-címedet, amivel bejelentkeztél!
                </Typography>
            </Box>
        )
    }

    if (hasViewerRole === undefined || !isAllDataLoaded) {
        return (
            <Box className={css.barkochbaScreen} sx={{ padding: { xs: 2, sm: 3 } }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>
                    <Skeleton variant="rounded" height={56} sx={{ borderRadius: 3 }} />
                    <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} variant="rounded" height={48} sx={{ borderRadius: 2 }} />
                    ))}
                </Box>
            </Box>
        )
    }

    return (
        <div className={css.barkochbaScreen}>
            <Box component="div" sx={{ display: { xs: "none", sm: "block" }, width: 320, flexShrink: 0 }}>
                <BarkochbaDrawer />
            </Box>
            <Box
                component="div"
                sx={{ display: { sm: "none", xs: "block" } }}
                className={css.barkochbaScreenMobileDrawerContainer}
            >
                <SwipeableDrawer
                    className={css.barkochbaScreenMobileDrawer}
                    variant="temporary"
                    open={barkochbaDrawerIsOpen}
                    onOpen={handleDrawerOpen}
                    onClose={handleDrawerClose}
                    PaperProps={{
                        className: css.barkochbaScreenMobileDrawerPaper,
                    }}
                >
                    <BarkochbaDrawer />
                </SwipeableDrawer>
            </Box>

            <div className={css.barkochbaScreenContentArea}>
                <Box
                    component="div"
                    sx={{ display: { sm: "none", xs: "block" } }}
                    className={css.barkochbaScreenDrawerToggle}
                >
                    <Button
                        className={css.barkochbaScreenDrawerToggleButton}
                        variant="outlined"
                        color="secondary"
                        onClick={handleDrawerToggle}
                        startIcon={<MenuIcon />}
                    >
                        Navigáció és barkochbatörténetek
                    </Button>
                </Box>
                <div className={css.barkochbaScreenPersonSelector}>
                    <Accordion elevation={0} defaultExpanded={true}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography variant="subtitle1">{personSelectorTitle}</Typography>
                        </AccordionSummary>
                        <AccordionDetails className={css.personSelectorContent}>
                            <Typography variant="body2" paragraph={true}>
                                Válaszd ki a tábort és a szobát, vagy írd be azon gyerekek neveit, akiknek mesélni
                                szeretnél. Ezután a listában színesek lesznek azok a barkochbatörténetek, amelyeket
                                valamelyik bejelölt gyerek már hallotta.
                            </Typography>
                            <ListeningCampRoomSelector />
                            <PersonsSelector
                                allPersons={personsAsSelectOptions}
                                selectedPersons={currentListeningPersonsAsSelectOptions}
                                onChange={handleCurrentListeningPersonsChange}
                            />
                        </AccordionDetails>
                    </Accordion>
                </div>
                <div className={css.barkochbaScreenPanel}>
                    <StoryPanel />
                </div>
            </div>
        </div>
    );
}