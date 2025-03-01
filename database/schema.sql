DROP TABLE IF EXISTS users CASCADE;
CREATE TABLE users (
    UID SERIAL PRIMARY KEY,
    Username VARCHAR(100) NOT NULL,
    Password VARCHAR(100) DEFAULT NULL
);

DROP TABLE IF EXISTS junctions CASCADE;
CREATE TABLE junctions (
    JID SERIAL PRIMARY KEY, 
    UID INTEGER REFERENCES users(UID) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    JName VARCHAR(50),
    VPHObject JSONB NOT NULL,
    JStateID INTEGER REFERENCES junction_states(JStateID) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastUpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS junction_layouts CASCADE;
CREATE TABLE junction_layouts (
    JLID SERIAL PRIMARY KEY,
    JID INTEGER REFERENCES junctions(JID) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    JLName VARCHAR(50),
    ConfigurationObject JSONB NOT NULL,
    JLStateID INTEGER REFERENCES junction_layout_states(JLStateID) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    CreatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    LastUpdatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS simulation_results CASCADE;
CREATE TABLE simulation_results (
    SID SERIAL PRIMARY KEY,
    JLID INTEGER REFERENCES junction_layouts(JLID) ON DELETE CASCADE ON UPDATE CASCADE NOT NULL,
    ResultsObject JSONB NOT NULL
);

DROP TABLE IF EXISTS junction_states CASCADE;
CREATE TABLE junction_states (
    JStateID INTEGER PRIMARY KEY,
    JStateName VARCHAR(50) UNIQUE NOT NULL,
    JStateDescription VARCHAR(255) NOT NULL
);

DROP TABLE IF EXISTS junction_layout_states CASCADE;
CREATE TABLE junction_layout_states (
    JLStateID INTEGER PRIMARY KEY,
    JLStateName VARCHAR(50) UNIQUE NOT NULL,
    JLStateDescription VARCHAR(255) NOT NULL
);

--Triggers to automatically maintain the lastUpdatedAt columns
CREATE TRIGGER updated_junction BEFORE UPDATE ON junctions -- For junctions
FOR EACH ROW
EXECUTE FUNCTION update_lastUpdatedAt();

CREATE TRIGGER updated_junction_layout BEFORE UPDATE ON junction_layouts -- For junction_layouts
FOR EACH ROW
EXECUTE FUNCTION update_lastUpdatedAt();

CREATE OR REPLACE FUNCTION update_lastUpdatedAt() RETURNS TRIGGER
AS $$
    BEGIN
        NEW.LastUpdatedAt = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;


-- If all layouts created for a certain junction have finished simulating, mark the junction's state as 'Finished'
CREATE TRIGGER finished_simulation AFTER UPDATE ON junction_layout_states
FOR EACH ROW
WHEN (NEW.JLStateName = 'Finished')
EXECUTE FUNCTION finished_simulation();

CREATE OR REPLACE FUNCTION finished_simulation() RETURNS TRIGGER
AS $$
    DECLARE
        junction_id INT;
        all_finished BOOLEAN;
    BEGIN
        -- Get the jid for the junction who's layout just finished simulating
        SELECT JID INTO junction_id
        FROM junction_layout
        WHERE JLStateID = NEW.JLStateID;

        -- Check if all layouts for this junction are finished
        SELECT NOT EXISTS (
            SELECT 1
            FROM junction_layout AS jl
            JOIN junction_layout_states AS jls ON jl.JLStateID = jls.JLStateID
            WHERE jl.JID = junction_id
            AND jls.JLStateName <> 'Finished'
        ) INTO all_finished;

        -- If all layouts are finished, update the junction_states table to reflect that
        IF all_finished THEN
            UPDATE junction_states
            SET JStateName = 'Finished',
                JStateDescription = 'All layouts for this junction have finished simulating'
            WHERE JStateID = (
                SELECT JStateID
                FROM junctions
                WHERE JID = junction_id
            );
        END IF;

        RETURN NEW;
    END;
$$ LANGUAGE plpgsql;


-- Initialise the state tables since the states are predefined
INSERT INTO junction_states (JStateID, JStateName, JStateDescription)
VALUES
    (1, 'New', 'The junction has no created configurations yet'),
    (2, 'Not Started', 'No layouts for this junction have started simulating'),
    (3, 'In Progress', 'The layouts for this junction are currently being simulated'),
    (4, 'Finished', 'All of the layouts for this junctions have finished simulating')
ON CONFLICT (JStateName) DO NOTHING;

INSERT INTO junction_layout_states (JLStateID, JLStateName, JLStateDescription)
VALUES
    (1, 'Not Started', 'The layout has not started simulating'),
    (2, 'In Progress', 'The layouts is currently being simulated'),
    (3, 'Finished', 'The layout has successfully been simulated'),
    (4, 'Simulation Error', 'An error occurred during the simulation of this layout'),
    (5, 'Score Calculation Error', 'An error occurred during the score calculation for this layout')
ON CONFLICT (JLStateName) DO NOTHING;